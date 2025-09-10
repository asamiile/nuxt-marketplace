// supabase/functions/product-status-notifier/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId, status } = await req.json()
    if (!productId || !status) {
      throw new Error('productId and status are required.')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch product details
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('name, creator_id, admin_notes')
      .eq('id', productId)
      .single()

    if (productError) throw productError
    if (!productData) throw new Error(`Product with ID ${productId} not found.`)

    // 2. Fetch creator's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(productData.creator_id)

    if (userError) throw userError
    if (!userData.user) throw new Error(`User with ID ${productData.creator_id} not found.`)

    const creatorEmail = userData.user.email
    if (!creatorEmail) {
      // If user has no email, we can't notify them. Log this and exit gracefully.
      console.warn(`User ${productData.creator_id} has no email address. Cannot send notification.`)
      return new Response(JSON.stringify({ message: 'User has no email address.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    let subject = ''
    let htmlBody = ''

    if (status === 'approved') {
      subject = `[お知らせ] 商品「${productData.name}」が出品されました`
      htmlBody = `
        <p>出品された商品「${productData.name}」が管理者に承認され、公開されました。</p>
        <p>引き続きのご利用をお待ちしております。</p>
      `
    } else if (status === 'rejected') {
      subject = `[重要] 商品「${productData.name}」の出品に関するお知らせ`
      htmlBody = `
        <p>ご出品いただいた商品「${productData.name}」について、管理者による審査の結果、今回は出品を見送らせていただくことになりました。</p>
        <p><strong>管理者からのメモ:</strong></p>
        <p>${productData.admin_notes || '特記事項なし'}</p>
        <p>内容を修正の上、再度ご申請いただくことが可能です。ご確認のほどよろしくお願いいたします。</p>
      `
    } else {
      // If status is not 'approved' or 'rejected', do nothing.
      return new Response(JSON.stringify({ message: 'No notification sent for this status.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { data, error: sendError } = await resend.emails.send({
      from: 'noreply@your-marketplace.com',
      to: creatorEmail,
      subject: subject,
      html: htmlBody,
    })

    if (sendError) {
      throw sendError
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
