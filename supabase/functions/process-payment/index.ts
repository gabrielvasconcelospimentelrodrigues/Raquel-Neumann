import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { paymentData, customerInfo, address, cartItems, shipping, total } = await req.json()

    // Payment Brick v2 sends data inside formData
    const formData = paymentData?.formData ?? paymentData

    // 1. Get Settings from Database
    const { data: settings } = await supabaseClient
      .from('content')
      .select('key, value')
      .in('key', ['mercadopago_access_token', 'mercadopago_statement_descriptor'])

    const accessToken = settings?.find(s => s.key === 'mercadopago_access_token')?.value
    const statementDescriptor = settings?.find(s => s.key === 'mercadopago_statement_descriptor')?.value

    if (!accessToken) {
      throw new Error('Mercado Pago Access Token not configured')
    }

    // 2. Build payment body based on payment method
    const mpBody: Record<string, any> = {
      transaction_amount: Number(total),
      description: `Compra na Raquel Neuman - ${cartItems.map((i: any) => i.name).join(', ')}`,
      statement_descriptor: statementDescriptor || 'RAQUEL NEUMAN',
      payment_method_id: formData.payment_method_id,
      payer: {
        email: customerInfo.email || formData.payer?.email,
        first_name: customerInfo.name.split(' ')[0],
        last_name: customerInfo.name.split(' ').slice(1).join(' ') || customerInfo.name.split(' ')[0],
        // Prefer identification from Brick (validated by MP) over our form field
        identification: formData.payer?.identification ?? {
          type: 'CPF',
          number: customerInfo.cpf?.replace(/\D/g, '') ?? '',
        },
      },
    }

    // Credit/debit card requires token and installments
    if (formData.token) {
      mpBody.token = formData.token
      mpBody.issuer_id = formData.issuer_id
      mpBody.installments = Number(formData.installments) || 1
    }

    // 2. Process Payment with Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(mpBody),
    })

    const mpResult = await mpResponse.json()
    console.log('MP Result:', JSON.stringify(mpResult))

    if (mpResult.status === 'rejected') {
       return new Response(JSON.stringify({ status: 'rejected', detail: mpResult.status_detail }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
    }

    if (!mpResult.id) {
      const cause = mpResult.cause?.[0]?.description
      const detail = [mpResult.message, cause].filter(v => v && v !== 'null').join(' - ')
      throw new Error(detail || mpResult.error || 'Payment failed')
    }

    // 3. Create/Update Customer
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .upsert({
        email: customerInfo.email,
        full_name: customerInfo.name,
        phone: customerInfo.phone,
        document: customerInfo.cpf,
      }, { onConflict: 'email' })
      .select()
      .single()

    if (customerError) throw customerError

    // 4. Create Order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customer.id,
        amount: total,
        status: mpResult.status === 'approved' ? 'paid' : (mpResult.status === 'in_process' ? 'pending' : 'failed'),
        payment_method: formData.payment_method_id,
        payment_id: mpResult.id,
        shipping_address: address,
        shipping_method: shipping?.name,
        shipping_cost: shipping?.price || 0,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 5. Create Order Items
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      item_id: item.id,
      item_type: item.type,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    const responseBody: Record<string, any> = { status: mpResult.status, orderId: order.id }

    // For PIX (bank_transfer), include QR code data
    if (mpResult.payment_method_id === 'pix' || mpResult.status === 'pending') {
      const txData = mpResult.point_of_interaction?.transaction_data
      if (txData?.qr_code) {
        responseBody.pixQrCode = txData.qr_code
        responseBody.pixQrCodeBase64 = txData.qr_code_base64
        responseBody.pixExpirationDate = txData.ticket_url
      }
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
