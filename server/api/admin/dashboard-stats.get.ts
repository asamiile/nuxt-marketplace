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

  // concurrently call all dashboard stats functions
  const [
    { data: monthlySales, error: salesError },
    { data: newUsersCount, error: usersError },
    { data: pendingProductsCount, error: productsError },
    { data: unresolvedContactsCount, error: contactsError },
  ] = await Promise.all([
    client.rpc('get_monthly_sales'),
    client.rpc('count_new_users'),
    client.rpc('count_pending_products'),
    client.rpc('count_unresolved_contacts'),
  ])

  if (salesError || usersError || productsError || contactsError) {
    console.error('Error fetching dashboard stats:', { salesError, usersError, productsError, contactsError })
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dashboard statistics',
    })
  }

  return {
    monthlySales,
    newUsersCount,
    pendingProductsCount,
    unresolvedContactsCount,
  }
})
