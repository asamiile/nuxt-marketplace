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
  const contactId = event.context.params?.id

  if (!contactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contact ID is required',
    })
  }

  const { data: contact, error } = await client
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single()

  if (error) {
    console.error(`Error fetching contact with id ${contactId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch contact: ${error.message}`,
    })
  }

  if (!contact) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Contact not found',
    })
  }

  return contact
})
