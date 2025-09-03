// supabase/functions/contact/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // ★ デバッグログ1: 関数が呼び出されたか確認
  console.log('Function started. Method:', req.method);

  if (req.method === 'OPTIONS') {
    // ★ デバッグログ2: OPTIONSリクエストを処理したか確認
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ★ デバッグログ3: tryブロックに入ったか確認
    console.log('Entering TRY block');

    // ★ デバッグログ4: APIキーが読み込めているか確認
    const apiKey = Deno.env.get('RESEND_API_KEY');
    console.log('RESEND_API_KEY:', apiKey ? 'Found' : 'NOT FOUND!');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set in Supabase secrets.');
    }
    const resend = new Resend(apiKey);
    
    const body = await req.json();
    // ★ デバッグログ5: リクエストボディが受け取れているか確認
    console.log('Request body:', body);
    const { name, email: replyTo, subject, message } = body;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'あなたがResendに登録したメールアドレス@example.com', // ★ご自身のメールアドレスに書き換えてください
      subject: `【お問い合わせ】${subject}`,
      html: `<p>お問い合わせがありました。<br>名前: ${name}<br>返信先: ${replyTo}<br>内容: ${message}</p>`,
    })

    if (error) {
      // ★ デバッグログ6: Resendからのエラーを記録
      console.error('Resend API error:', error);
      throw error
    }

    console.log('Email sent successfully');
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    // ★ デバッグログ7: catchブロックでエラーを捕捉したか確認
    console.error('Caught error in CATCH block:', err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})