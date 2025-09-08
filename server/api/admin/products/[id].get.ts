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
  const productId = event.context.params?.id

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required',
    })
  }

  const { data: product, error } = await client
    .from('products')
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq('id', productId)
    .single()

  if (error) {
    console.error(`Error fetching product with id ${productId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch product: ${error.message}`,
    })
  }

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
    })
  }

  return product
})
