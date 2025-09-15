import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client.from('site_settings').select('key, value')

  if (error) {
    console.error('Error fetching site settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch site settings',
    })
  }

  // Transform the array of {key, value} objects into a single object
  const settings = data.reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return settings
})
