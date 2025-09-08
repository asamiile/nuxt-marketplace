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

  // Fetch all products
  const { data: products, error } = await client
    .from('products')
    .select(`
      *,
      profiles (
        username
      )
    `)

  if (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    })
  }

  return products
})
