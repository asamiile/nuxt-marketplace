import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Nuxt Supabase module exposes these variables to the server context
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

  const { data, error } = await client
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contacts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contacts',
    })
  }

  return data
})
