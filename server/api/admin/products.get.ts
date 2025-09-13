import { createClient } from '@supabase/supabase-js'
import { getQuery } from 'h3'
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
  const query = getQuery(event)
  const searchQuery = query.q as string
  const userId = query.userId as string

  let supabaseQuery = client
    .from('products')
    .select(`
      *,
      profiles (
        username
      )
    `)

  if (searchQuery) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  if (userId) {
    supabaseQuery = supabaseQuery.eq('creator_id', userId)
  }

  const { data: products, error } = await supabaseQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    })
  }

  return products
})
