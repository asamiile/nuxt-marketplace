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

  // Create a new client with the service_role key to bypass RLS
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)

  // Fetch all users from the auth schema
  const { data: usersData, error } = await client.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users',
    })
  }

  // Map the user data to include the is_admin flag
  const users = usersData.users.map(user => ({
    ...user,
    is_admin: user.app_metadata?.claims_admin === true,
  }))

  return users
})
