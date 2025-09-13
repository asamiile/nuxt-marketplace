import { serverSupabaseClient } from '#supabase/server'
import { getQuery } from 'h3'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const searchQuery = query.q as string

  let supabaseQuery = client
    .from('categories')
    .select('*')

  if (searchQuery) {
    supabaseQuery = supabaseQuery.ilike('name', `%${searchQuery}%`)
  }

  const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories',
    })
  }

  return data
})
