import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'resend'

// CORSヘッダーを設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflightリクエストへの対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ResendのAPIキーを環境変数から取得
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const { name, email: replyTo, subject, message } = await req.json()

    // メールを送信
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // テスト用の送信元アドレス
      to: 'あなたのメールアドレス@example.com', // ★★★ あなたがResendに登録したメールアドレスに書き換えてください ★★★
      subject: `【お問い合わせ】${subject}`,
      html: `
        <p>お問い合わせがありました。</p>
        <ul>
          <li><strong>お名前:</strong> ${name}</li>
          <li><strong>返信先:</strong> ${replyTo}</li>
        </ul>
        <hr>
        <p><strong>内容:</strong></p>
        <p>${message}</p>
      `,
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
