import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

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
  const userId = event.context.params?.id

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  const { disabled } = await readBody(event)

  const { error } = await client.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? 'inf' : 'none',
  })

  if (error) {
    console.error(`Error updating user ${userId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update user: ${error.message}`,
    })
  }

  return { success: true }
})
