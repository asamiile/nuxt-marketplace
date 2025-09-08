import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Use the user-scoped client to correctly pass the user's JWT to the database.
  // The RPC function is `security definer`, so it runs with the function owner's privileges,
  // but the `is_claims_admin()` check inside the function can now correctly
  // inspect the claims of the user making the request.
  const client = await serverSupabaseClient<Database>(event)

  const query = getQuery(event)
  const searchTerm = query.q as string | undefined

  const { data, error } = await client.rpc('get_all_users', {
    p_search_term: searchTerm || null
  })

  if (error) {
    console.error('Error calling get_all_users function:', error)
    // The error from the DB function will be more informative now
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch users: ${error.message}`,
    })
  }

  return data
})
