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
  const purchaseId = event.context.params?.id

  if (!purchaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase ID is required',
    })
  }

  // Step 1: Fetch the purchase data with profile username and product details
  const { data: purchase, error: purchaseError } = await client
    .from('purchases')
    .select(`
      *,
      profiles (
        username
      ),
      products (
        *
      )
    `)
    .eq('id', purchaseId)
    .single()

  if (purchaseError) {
    console.error(`Error fetching purchase with id ${purchaseId}:`, purchaseError)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch purchase: ${purchaseError.message}`,
    })
  }

  if (!purchase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Purchase not found',
    })
  }

  if (!purchase.user_id) {
    // Should not happen if data integrity is maintained, but good to handle.
    return purchase
  }

  // Step 2: Fetch the user's auth data to get the email
  const { data: authUser, error: authError } = await client.auth.admin.getUserById(purchase.user_id)

  if (authError) {
    // Log the error but don't fail the whole request, as we still have purchase data
    console.error(`Could not fetch auth user for id ${purchase.user_id}:`, authError)
  }

  // Step 3: Combine the data
  // Ensure profiles object exists before assigning to it
  if (!purchase.profiles) {
    // @ts-ignore
    purchase.profiles = {}
  }

  if (authUser) {
    // @ts-ignore
    purchase.profiles.email = authUser.user.email
  }

  return purchase
})
