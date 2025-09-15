import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

// This is a public endpoint and does not require authentication
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.from('site_settings').select('key, value')

  if (error) {
    console.error('Error fetching site settings:', error)
    // Avoid exposing detailed errors to the public
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }

  // Transform the array of {key, value} objects into a single object
  const settings = data.reduce((acc, { key, value }) => {
    if (value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)

  return settings
})
