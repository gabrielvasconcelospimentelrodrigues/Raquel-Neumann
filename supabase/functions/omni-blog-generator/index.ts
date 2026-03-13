// Supabase Edge Function: omni-blog-generator
// Este código orquestra a IA (Gemini/OpenAI), busca contexto no BD e gera imagens via DALL-E.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    // 1. Verificar Configurações no BD
    const { data: settingsData } = await supabase.from('content').select('key, value');
    const config = Object.fromEntries(settingsData?.map(s => [s.key, s.value]) || []);

    if (config.autopost_enabled !== 'true') {
      return new Response(JSON.stringify({ message: 'Autopost desativado nas configurações.' }), { status: 200 });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || config.gemini_api_key;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || config.openai_api_key;

    if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
      throw new Error('Chaves de API (Gemini ou OpenAI) não encontradas.');
    }

    // 2. Coletar Contexto do Negócio (Produtos e Cursos)
    const [products, courses, existingCategories] = await Promise.all([
      supabase.from('products').select('name, description, price, image_url').limit(15),
      supabase.from('courses').select('title, description, price, instructor').limit(10),
      supabase.from('post_categories').select('id, name')
    ]);

    const businessContext = `
      PRODUTOS: ${JSON.stringify(products.data)}
      CURSOS: ${JSON.stringify(courses.data)}
      CATEGORIAS DISPONÍVEIS: ${JSON.stringify(existingCategories.data)}
    `;

    // 3. Orquestração da IA (Conteúdo)
    const prompt = `
      Você é um Redator Especialista em Fisioterapia e Bem-estar para a marca "Raquel Neuman".
      Sua missão é criar um artigo de blog ENGAJADOR, EDUCATIVO e PERSUASIVO que converta leitores em clientes.

      CONTEXTO DO NEGÓCIO (Use estes itens como referência no texto):
      ${businessContext}

      INSTRUÇÕES ESPECÍFICAS:
      ${config.autopost_instructions || 'Crie um post sobre os benefícios da fisioterapia preventiva.'}

      REGRAS DE OURO:
      1. Use um tom elegante, profissional e acolhedor.
      2. Otimize para SEO (palavras-chave no título e subtítulos).
      3. Se mencione produtos ou cursos, use os nomes exatamentes como fornecidos.
      4. Sugira uma categoria existente ou uma nova que faça sentido.
      5. Retorne APENAS um JSON puro no formato abaixo.

      ESTRUTURA JSON:
      {
        "title": "Título H1",
        "slug": "url-do-post",
        "excerpt": "Resumo para SEO",
        "category_name": "Nome da Categoria",
        "content_blocks": [
          {"type": "text", "content": "Parágrafo inicial..."},
          {"type": "title", "level": 2, "content": "Subtítulo"},
          {"type": "text", "content": "Mais conteúdo..."},
          {"type": "image_prompt": "Descrição para IA gerar imagem: ex: Mulher fazendo pilates em estúdio clean"},
          {"type": "divider"},
          {"type": "text", "content": "Conclusão e Call to Action"}
        ],
        "featured_image_prompt": "Prompt visual para a capa do post"
      }
    `;

    // 4. Chamar API de IA (Preferência Gemini)
    let postJson;
    if (GEMINI_API_KEY) {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      const data = await resp.json();
      postJson = JSON.parse(data.candidates[0].content.parts[0].text);
    } else {
      // Fallback OpenAI GPT-4
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      const data = await resp.json();
      postJson = JSON.parse(data.choices[0].message.content);
    }

    // 5. Gerar Imagens (DALL-E 3) e Salvar
    const generateImage = async (imagePrompt: string) => {
      if (!OPENAI_API_KEY) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80'; // Fallback Unsplash

      const genResp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${imagePrompt} | Estilo: Fotografia profissional, iluminação suave, tons neutros e vinhos elegantes, alta definição.`,
          size: "1024x1024",
          quality: "hd",
          n: 1
        })
      });
      
      const genData = await genResp.json();
      if (!genData.data || !genData.data[0]) throw new Error('Falha na geração de imagem: ' + JSON.stringify(genData));
      
      const imageUrl = genData.data[0].url;

      // Baixar imagem e subir para o Supabase Storage
      const imgFetch = await fetch(imageUrl);
      const imgBlob = await imgFetch.blob();
      const fileName = `ai_gen_${Date.now()}_${Math.random().toString(36).substr(2)}.png`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, imgBlob, { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      return publicUrl;
    };

    // Gerar Capa
    const featuredImageUrl = await generateImage(postJson.featured_image_prompt);

    // Processar Blocos de Conteúdo (Gerar imagens internas se houver)
    const finalBlocks = [];
    for (const block of postJson.content_blocks) {
      if (block.type === 'image_prompt') {
        const url = await generateImage(block.content || block.prompt);
        finalBlocks.push({ type: 'image', content: url });
      } else {
        finalBlocks.push(block);
      }
    }

    // 6. Gerenciar Categoria
    let categoryId = null;
    const catMatch = existingCategories.data?.find(c => c.name.toLowerCase() === postJson.category_name.toLowerCase());
    
    if (catMatch) {
      categoryId = catMatch.id;
    } else {
      const { data: newCat, error: catError } = await supabase
        .from('post_categories')
        .insert([{ name: postJson.category_name }])
        .select()
        .single();
      if (!catError) categoryId = newCat.id;
    }

    // 7. Inserir no Banco de Dados
    const { data: insertedPost, error: insertError } = await supabase.from('posts').insert({
      title: postJson.title,
      slug: postJson.slug,
      excerpt: postJson.excerpt,
      content: finalBlocks,
      image_url: featuredImageUrl,
      category_id: categoryId,
      published: true
    }).select().single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      success: true, 
      post_id: insertedPost.id, 
      title: insertedPost.title 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Falha no blog generator:', err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
