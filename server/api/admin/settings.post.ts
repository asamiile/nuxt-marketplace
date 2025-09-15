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

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'No form data received' })
  }

  const settingsToUpsert: { key: string; value: string }[] = []

  // 1. Process text fields and add them to the list
  formData.forEach(part => {
    if (part.name && !part.filename && part.data) {
      settingsToUpsert.push({ key: part.name, value: part.data.toString('utf-8') })
    }
  })

  // 2. Process file uploads, upload them, and add their URLs to the same list
  const fileParts = formData.filter(p => p.filename && (p.name === 'logo' || p.name === 'favicon'))

  for (const filePart of fileParts) {
    const { name, data, type, filename } = filePart
    if (!name || !data || !type || !filename) continue

    const fileExt = filename.split('.').pop()
    const filePath = `site/${name}.${fileExt}`

    const { error: uploadError } = await client.storage
      .from('assets')
      .upload(filePath, data, {
        contentType: type,
        upsert: true,
      })

    if (uploadError) {
      console.error(`Error uploading ${name}:`, uploadError)
      throw createError({ statusCode: 500, message: `Failed to upload ${name}: ${uploadError.message}` })
    }

    const { data: urlData, error: urlError } = client.storage.from('assets').getPublicUrl(filePath)

    if (urlError || !urlData?.publicUrl) {
      console.error(`Error getting public URL for ${name}:`, urlError)
      throw createError({ statusCode: 500, message: `Could not get public URL for ${name}.` })
    }

    settingsToUpsert.push({ key: `${name}_url`, value: urlData.publicUrl })
  }

  // 3. Perform a single batch upsert operation
  if (settingsToUpsert.length > 0) {
    const { error: dbError } = await client.from('site_settings').upsert(settingsToUpsert, { onConflict: 'key' })
    if (dbError) {
      console.error('Error batch saving settings:', dbError)
      throw createError({ statusCode: 500, message: `Failed to save settings: ${dbError.message}` })
    }
  }

  // 4. Fetch and return the fresh data
  const { data: freshData, error: fetchError } = await client.from('site_settings').select('key, value')

  if (fetchError) {
    // The save succeeded, but the fetch failed. Log the error but still return success.
    console.error('Error fetching settings after update:', fetchError)
    return { success: true, message: 'Settings updated, but failed to fetch latest data.' }
  }

  const freshSettings = freshData.reduce((acc, { key, value }) => {
    if (value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, string>)


  return freshSettings
})
