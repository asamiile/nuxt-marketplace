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

  const body = await readBody(event)

  // We only allow updating certain fields
  const { name, description, price, category_id, status, admin_notes } = body;
  const updateData = { name, description, price, category_id, status, admin_notes };


  const { data: updatedProduct, error } = await client
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating product with id ${productId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update product: ${error.message}`,
    })
  }

  return updatedProduct
})
