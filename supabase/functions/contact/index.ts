// supabase/functions/contact/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

// 定数としてCORSヘッダーを定義（コードの重複を避けるため）
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // ★★★ CORSプリフライトリクエストへの対応を追加 ★★★
  // リクエストのメソッドがOPTIONSの場合は、CORSヘッダーを含んだ200 OKレスポンスをすぐに返す
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const { name, email, subject, message } = await req.json()

    // ★★★ Supabaseクライアントを初期化 ★★★
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ★★★ contactsテーブルにデータを挿入 ★★★
    const { error: insertError } = await supabase.from('contacts').insert({
      name,
      email,
      subject,
      message,
    })

    if (insertError) {
      throw insertError
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: Deno.env.get('CONTACT_FORM_EMAIL_TO'),
      subject: `【お問い合わせ】${subject}`,
      html: `
        <p>お問い合わせがありました。</p>
        <ul>
          <li><strong>お名前:</strong> ${name}</li>
          <li><strong>返信先:</strong> ${email}</li>
        </ul>
        <hr>
        <p><strong>内容:</strong></p>
        <p>${message}</p>
      `,
      reply_to: email,
    })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // 成功時もCORSヘッダーを含める
      status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // エラー時もCORSヘッダーを含める
      status: 500,
    })
  }
})
