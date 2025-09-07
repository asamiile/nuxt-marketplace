import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

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
