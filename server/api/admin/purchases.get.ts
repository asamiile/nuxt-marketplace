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

  const { data, error } = await client
    .from('purchases')
    .select(`
      id,
      created_at,
      user:profiles(username),
      product:products(name, price)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching purchases:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch purchases',
    })
  }

  return data
})
