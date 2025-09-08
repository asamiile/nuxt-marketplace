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

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
  const userId = event.context.params?.id as string

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  const { data: { user }, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    console.error(`Error fetching user with id ${userId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch user: ${error.message}`,
    })
  }

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Add the is_admin flag for consistency
  const result = {
    ...user,
    is_admin: user.app_metadata?.claims_admin === true,
  }

  return result
})
