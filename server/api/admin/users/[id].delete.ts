import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase environment variables are not set.')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Supabase configuration missing.',
    })
  }

  // We must use the service_role key to delete users.
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
  const userId = event.context.params?.id as string

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  const { data, error } = await client.auth.admin.deleteUser(userId)

  if (error) {
    console.error(`Error deleting user ${userId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete user: ${error.message}`,
    })
  }

  return { success: true, message: `User ${userId} deleted successfully.` }
})
