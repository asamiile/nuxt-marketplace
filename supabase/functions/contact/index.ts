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
    const { data: newContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        subject,
        message,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    if (!newContact) {
      throw new Error('Failed to retrieve contact details after creation.')
    }

    const contactId = newContact.id
    // 環境変数からサイトURLを取得（未設定の場合はデフォルトのURLを使用）
    const siteUrl = Deno.env.get('SITE_URL') || 'https://your-marketplace.com'
    const adminUrl = `${siteUrl}/admin/contacts/${contactId}`

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
        <hr>
        <p>管理画面で確認する: <a href="${adminUrl}">${adminUrl}</a></p>
      `,
      reply_to: email,
    })

    if (error) {
      throw error
    }

    // ★★★ ユーザーへの自動返信メールを送信 ★★★
    await resend.emails.send({
      from: 'noreply@your-marketplace.com',
      to: email, // ユーザーのメールアドレス
      subject: '【Marketplace】お問い合わせありがとうございます',
      html: `<p>${name} 様</p><p>この度はお問い合わせいただき、誠にありがとうございます。以下の内容でお問い合わせを受け付けました。</p><hr><p><strong>件名:</strong> ${subject}</p><p><strong>内容:</strong></p><p>${message.replace(/\n/g, '<br>')}</p><hr><p>内容を確認の上、担当者より改めてご連絡いたしますので、今しばらくお待ちください。</p>`,
    })

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
