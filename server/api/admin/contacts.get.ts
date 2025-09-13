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

  let supabaseQuery = client
    .from('contacts')
    .select('*')

  if (searchQuery) {
    const orQuery = [
      `name.ilike.%${searchQuery}%`,
      `email.ilike.%${searchQuery}%`,
      `subject.ilike.%${searchQuery}%`,
      `message.ilike.%${searchQuery}%`,
    ].join(',')
    supabaseQuery = supabaseQuery.or(orQuery)
  }

  const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contacts',
    })
  }

  return data
})
