// supabase/functions/contact/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@3.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailTo = Deno.env.get('CONTACT_FORM_EMAIL_TO')

    if (!resendApiKey || !emailTo) {
      throw new Error('Required secrets (RESEND_API_KEY or CONTACT_FORM_EMAIL_TO) are not set.')
    }

    const resend = new Resend(resendApiKey)
    const { name, email: replyTo, subject, message } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emailTo, // Secretから読み込んだメールアドレスを使用
      subject: `【お問い合わせ】${subject}`,
      html: `<p>お問い合わせがありました。<br>名前: ${name}<br>返信先: ${replyTo}<br>内容: ${message}</p>`,
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