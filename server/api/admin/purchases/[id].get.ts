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

  const { data: purchase, error } = await client
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

  if (error) {
    console.error(`Error fetching purchase with id ${purchaseId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch purchase: ${error.message}`,
    })
  }

  if (!purchase) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Purchase not found',
    })
  }

  return purchase
})
