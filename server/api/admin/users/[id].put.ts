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

  const { is_admin } = await readBody(event)

  if (typeof is_admin !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'is_admin flag is required and must be a boolean',
    })
  }

  const { data: { user }, error } = await client.auth.admin.updateUserById(
    userId,
    {
      app_metadata: {
        claims_admin: is_admin,
      },
    }
  )

  if (error) {
    console.error(`Error updating user ${userId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update user: ${error.message}`,
    })
  }

  const result = {
    ...user,
    is_admin: user.app_metadata?.claims_admin === true,
  }

  return result
})
