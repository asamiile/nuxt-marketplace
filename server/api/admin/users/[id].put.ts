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

  const body = await readBody(event)
  const { is_admin, username, bio } = body

  // Update profile if username or bio are provided
  const profileUpdateData: { username?: string; bio?: string } = {}
  if (username !== undefined) profileUpdateData.username = username
  if (bio !== undefined) profileUpdateData.bio = bio

  if (Object.keys(profileUpdateData).length > 0) {
    const { error: profileError } = await client
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', userId)

    if (profileError) {
      console.error(`Error updating profile for user ${userId}:`, profileError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update user profile: ${profileError.message}`,
      })
    }
  }

  // Update admin status if is_admin is provided
  if (typeof is_admin === 'boolean') {
    const { error: authError } = await client.auth.admin.updateUserById(
      userId,
      {
        app_metadata: {
          claims_admin: is_admin,
        },
      }
    )

    if (authError) {
      console.error(`Error updating admin status for user ${userId}:`, authError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update user admin status: ${authError.message}`,
      })
    }
  }

  // Return the updated user data
  const { data: { user }, error: fetchError } = await client.auth.admin.getUserById(userId)

  if (fetchError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch updated user data.',
    })
  }

  const result = {
    ...user,
    is_admin: user.app_metadata?.claims_admin === true,
  }

  return result
})
