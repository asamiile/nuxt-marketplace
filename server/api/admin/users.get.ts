import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // 1. Verify the calling user is an admin. This is a crucial security check.
  const user = await serverSupabaseUser(event)
  if (!user?.app_metadata?.claims_admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Admin privileges required.' })
  }

  // 2. Create a privileged client to perform the admin action.
  const config = useRuntimeConfig(event)
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey) {
    console.error('SUPABASE_SERVICE_KEY is not set in environment variables.')
    throw createError({ statusCode: 500, statusMessage: 'Server configuration error.' })
  }

  const supabaseAdmin = createClient(config.public.supabase.url, serviceKey)

  // 3. List all users using the Admin API.
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000, // You might want to add pagination in the future
  })

  if (error) {
    console.error('Error listing users with admin client:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to list users.' })
  }

  // 4. Transform the data to match the expected format for the frontend.
  // We also sort by created_at descending to match the original function's behavior.
  const transformedData = users
    .map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_admin: u.app_metadata?.claims_admin === true,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return transformedData
})
