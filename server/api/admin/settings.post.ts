import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Ensure the user is an admin
  const user = await serverSupabaseUser(event)
  if (!user || user.app_metadata?.claims_admin !== true) {
    throw createError({ statusCode: 401, message: 'Unauthorized: Admin access required' })
  }

  // Get Supabase config from runtime config
  const config = useRuntimeConfig(event)
  const supabaseUrl = config.public.supabase.url
  const supabaseServiceKey = config.supabaseServiceKey

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase server environment variables are not configured in nuxt.config.')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Server configuration is missing.',
    })
  }

  // Create a service role client to bypass RLS
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Read the JSON body from the request
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  // Transform the body object into an array for upsert
  const settingsToUpsert = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value), // Ensure value is a string
  }))

  // Perform a single batch upsert operation
  if (settingsToUpsert.length > 0) {
    const { error: dbError } = await client.from('site_settings').upsert(settingsToUpsert, { onConflict: 'key' })
    if (dbError) {
      console.error('Error batch saving settings:', dbError)
      throw createError({ statusCode: 500, message: `Failed to save settings: ${dbError.message}` })
    }
  }

  // Fetch and return the fresh data
  const { data: freshData, error: fetchError } = await client.from('site_settings').select('key, value')

  if (fetchError) {
    console.error('Error fetching settings after update:', fetchError)
    throw createError({ statusCode: 500, message: 'Settings updated, but failed to fetch latest data.' })
  }

  const freshSettings = freshData.reduce((acc, { key, value }) => {
    if (value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)

  return freshSettings
})
