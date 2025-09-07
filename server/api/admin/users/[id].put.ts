import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase environment variables are not set.' })
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
  const userId = event.context.params?.id
  const { is_admin } = await readBody(event)

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  if (typeof is_admin !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'is_admin flag is required and must be a boolean' })
  }

  // Prevent the primary admin user from being changed
  // This is a hardcoded safeguard. The user's email is not available here,
  // but we can check against the hardcoded UUID from the seed file.
  const protectedAdminId = '00000000-0000-0000-0000-000000000003'
  if (userId === protectedAdminId) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot change the status of the primary admin.' })
  }

  const { error } = await client.rpc('set_admin_status', {
    user_id: userId,
    p_is_admin: is_admin,
  })

  if (error) {
    console.error('Error setting admin status:', error)
    throw createError({ statusCode: 500, statusMessage: `Failed to set admin status: ${error.message}` })
  }

  return { status: 200, statusText: 'Admin status updated successfully' }
})
