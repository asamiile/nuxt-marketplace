import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const userId = event.context.params?.id as string
  const body = await readBody(event)
  const { isAdmin } = body

  if (typeof isAdmin !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body: isAdmin must be a boolean' })
  }

  const { error } = await client.rpc('set_admin_status' as any, {
    target_user_id: userId,
    is_admin: isAdmin,
  })

  if (error) {
    console.error('Error calling set_admin_status RPC:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update admin status' })
  }

  return { success: true }
})
