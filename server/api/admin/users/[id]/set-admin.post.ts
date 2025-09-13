import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Supabase configuration missing.',
    })
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
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
