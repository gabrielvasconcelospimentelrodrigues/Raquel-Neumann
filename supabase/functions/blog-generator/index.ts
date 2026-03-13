import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders, status: 204 })

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(`${new Date().toISOString()}: ${msg}`);
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData = await req.json().catch(() => ({}));
    const { manual, debug } = requestData;
    log(`Process started. Manual: ${!!manual}`);

    // 1. Carregar configurações
    const { data: businessContext, error: configError } = await supabaseClient
      .from('content')
      .select('*')
      .in('key', [
        'site_name', 'site_description', 'autopost_enabled', 
        'gemini_api_key', 'openai_api_key', 'autopost_ai_provider', 'unsplash_access_key', 
        'autopost_topics', 'used_unsplash_ids', 'autopost_days', 'autopost_time', 'autopost_last_run'
      ])

    if (configError) throw new Error('Falha ao carregar configurações: ' + configError.message);

    const settings: any = {}
    businessContext?.forEach((c: any) => settings[c.key] = c.value)

    if (!settings.autopost_enabled && !manual) {
      log('Autopost is disabled.');
      return new Response(JSON.stringify({ message: "Autopost is disabled", logs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- LÓGICA DE AGENDAMENTO (BRASÍLIA UTC-3) ---
    const nowUtc = new Date();
    const brTime = new Date(nowUtc.getTime() - (3 * 3600000));
    const currentDay = brTime.getUTCDay();
    const currentHour = brTime.getUTCHours();
    const currentMinute = brTime.getUTCMinutes();
    const todayStr = brTime.toISOString().split('T')[0];
    const currentSlotString = `${brTime.getUTCFullYear()}-${brTime.getUTCMonth()}-${brTime.getUTCDate()}-${currentHour}`;

    const dayMapStr: Record<string, number> = {
      'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sab': 6, 'Dom': 0
    };

    let scheduledDays: string[] = [];
    try {
      let raw = settings.autopost_days || '[]';
      if (typeof raw === 'string' && raw.startsWith('"')) raw = JSON.parse(raw);
      scheduledDays = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(scheduledDays)) scheduledDays = [];
    } catch (e) { log(`Day parsing error: ${e.message}`); }

    const [schedHour, schedMin] = (settings.autopost_time || "09:00").split(':').map(Number);
    
    const isCorrectDay = scheduledDays.some(d => dayMapStr[d] === currentDay);
    const isCorrectTime = currentHour === schedHour;

    const schedulingStatus = {
      brasilia: { day: currentDay, hour: currentHour, min: currentMinute, date: todayStr },
      scheduled: { days: scheduledDays, hour: schedHour, time: settings.autopost_time },
      matches: { day: isCorrectDay, hour: isCorrectTime }
    };

    if (debug) {
      const { data: recentPosts } = await supabaseClient.from('posts').select('title, created_at').order('created_at', { ascending: false }).limit(3);
      (schedulingStatus as any).recentPosts = recentPosts;
    }

    log(`Check: Day Match=${isCorrectDay}, Hour Match=${isCorrectTime}. BR Time: ${currentHour}:${currentMinute}`);

    if (!manual && (!isCorrectDay || !isCorrectTime)) {
      return new Response(JSON.stringify({ 
        message: "Waiting for schedule window", 
        status: schedulingStatus,
        logs 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Prevenção de duplicados (mesmo dia e hora) usando um novo formato de slot
    if (!manual) {
      const lastRunSlot = settings.autopost_last_run_slot;
      if (lastRunSlot === currentSlotString) {
        log('Already executed in this slot.');
        return new Response(JSON.stringify({ message: "Already ran in this slot", status: schedulingStatus, logs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // --- GERAÇÃO ---
    log('Proceeding with generation...');
    const aiprovider = settings.autopost_ai_provider || 'gemini'
    const apiKey = aiprovider === 'gemini'
      ? (settings.gemini_api_key || Deno.env.get('GEMINI_API_KEY'))
      : (settings.openai_api_key || Deno.env.get('OPENAI_API_KEY'))

    if (!apiKey) throw new Error(`API Key missing`);

    // Função auxiliar para extrair JSON de respostas sujas da IA
    const extractJsonStr = (text: string) => {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? match[0] : text;
    };

    const siteName = settings.site_name || 'Raquel Neuman'
    const guidingTopics = settings.autopost_topics || 'saúde pélvica, fisioterapia';

    const model = aiprovider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o';
    const contentPrompt = `Você é "${siteName}". Escreva um post de blog premium e empático sobre: ${guidingTopics}. Responda APENAS com um objeto JSON válido, sem nenhum texto adicional antes ou depois. Formato: { "title": "...", "excerpt": "...", "blocks": [ {"type": "title", "content": "..."}, {"type": "text", "content": "..."}, {"type": "image", "content": "PLACEHOLDER"}, {"type": "text", "content": "..."}, {"type": "image", "content": "PLACEHOLDER"} ] }`;

    let content;
    if (aiprovider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST', body: JSON.stringify({ contents: [{ parts: [{ text: contentPrompt }] }] })
      });
      const j = await res.json();
      content = JSON.parse(extractJsonStr(j.candidates[0].content.parts[0].text));
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{role: 'user', content: contentPrompt}], response_format: {type: "json_object"} })
      });
      const j = await res.json();
      content = JSON.parse(extractJsonStr(j.choices[0].message.content));
    }

    const queryPrompt = `Generate 3 specific English Unsplash queries for this: ${JSON.stringify(content)}. Respond ONLY with a valid JSON object, no conversational text. Formato: { "f": "...", "w": ["...", "..."] }`;
    let q;
    if (aiprovider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST', body: JSON.stringify({ contents: [{ parts: [{ text: queryPrompt }] }] })
      });
      const j = await res.json();
      q = JSON.parse(extractJsonStr(j.candidates[0].content.parts[0].text));
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{role: 'user', content: queryPrompt}], response_format: {type: "json_object"} })
      });
      const j = await res.json();
      q = JSON.parse(extractJsonStr(j.choices[0].message.content));
    }

    const usedIds = (settings.used_unsplash_ids || '').split(',').filter(Boolean);
    const usedSet = new Set(usedIds);
    const processImg = async (s: string) => {
      let url = '';
      if (settings.unsplash_access_key) {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(s + " clinical wellness")}&per_page=5&client_id=${settings.unsplash_access_key}`);
        const j = await res.json();
        const p = j.results?.find((x: any) => !usedSet.has(x.id)) || j.results?.[0];
        if (p) {
          url = p.urls.regular;
          usedSet.add(p.id);
          usedIds.push(p.id);
        }
      }
      if (!url) url = "https://images.unsplash.com/photo-1545463913-5083aa7359a6?q=80&w=1200";
      const imgRes = await fetch(url);
      const buf = await imgRes.arrayBuffer();
      const path = `auto-post-${Date.now()}.jpg`;
      await supabaseClient.storage.from('site-images').upload(path, buf, { contentType: 'image/jpeg' });
      return supabaseClient.storage.from('site-images').getPublicUrl(path).data.publicUrl;
    };

    const fImg = await processImg(q.f);
    let wIdx = 0;
    const finalBlocks = await Promise.all(content.blocks.map(async (b: any) => {
      const nb = { ...b, id: Math.random().toString(36).substring(2, 11) };
      if (b.type === 'image') { nb.content = await processImg(q.w[wIdx++] || "wellness physiotherapy"); }
      return nb;
    }));

    const slug = content.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    await supabaseClient.from('posts').insert({ title: content.title, excerpt: content.excerpt, content: finalBlocks, image_url: fImg, slug, published: true, category_id: '8620808a-df45-4200-a544-245ed810ef8c' });
    
    await supabaseClient.from('content').upsert({ key: 'used_unsplash_ids', value: Array.from(usedSet).slice(-100).join(',') });
    
    // Apenas o verdadeiro auto-cron bloqueia a janela, testes manuais e debugs não bloqueiam
    if (!manual && !debug) {
      await supabaseClient.from('content').upsert({ key: 'autopost_last_run_slot', value: currentSlotString });
    }

    log('Success! Post created.');
    return new Response(JSON.stringify({ success: true, status: schedulingStatus, logs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    log('ERROR: ' + error.message);
    return new Response(JSON.stringify({ error: error.message, logs }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
