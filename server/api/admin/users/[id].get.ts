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

  // Fetch both user and profile data in parallel
  const [userResponse, profileResponse] = await Promise.all([
    client.auth.admin.getUserById(userId),
    client.from('profiles').select('username, bio').eq('id', userId).single()
  ])

  const { data: { user }, error: userError } = userResponse
  const { data: profile, error: profileError } = profileResponse

  if (userError) {
    console.error(`Error fetching user with id ${userId}:`, userError)
    throw createError({ statusCode: 500, statusMessage: `Failed to fetch user: ${userError.message}` })
  }

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  // Profile might not exist, which is a valid state, so we don't throw an error for that.
  // We just log it if something unexpected happens.
  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
     console.warn(`Could not fetch profile for user ${userId}: ${profileError.message}`)
  }

  // Combine the data
  const result = {
    ...user,
    is_admin: user.app_metadata?.claims_admin === true,
    username: profile?.username || null,
    bio: profile?.bio || null,
  }

  return result
})
