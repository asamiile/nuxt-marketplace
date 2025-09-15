import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // First, ensure the user is an admin
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

  // Since this is a protected admin route, we create a new client with the service role key to bypass RLS.
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Continue to use readMultipartFormData to handle file uploads
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, message: 'No form data received' })
  }

  const settingsToUpdate: { key: string; value: string }[] = []

  // Process text fields
  formData.forEach(part => {
    if (part.name && !part.filename && part.data) {
      settingsToUpdate.push({ key: part.name, value: part.data.toString('utf-8') })
    }
  })

  // Upsert text-based settings
  if (settingsToUpdate.length > 0) {
    const { error: dbError } = await client.from('site_settings').upsert(settingsToUpdate, { onConflict: 'key' })
    if (dbError) {
      console.error('Error saving text settings:', dbError)
      throw createError({ statusCode: 500, message: `Failed to save settings: ${dbError.message}` })
    }
  }

  // Handle file uploads and update their URLs
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

    const { data: { publicUrl } } = client.storage.from('assets').getPublicUrl(filePath)

    const urlKey = `${name}_url`
    const { error: urlUpdateError } = await client.from('site_settings').upsert({ key: urlKey, value: publicUrl }, { onConflict: 'key' })

    if (urlUpdateError) {
        console.error(`Error saving ${urlKey}:`, urlUpdateError)
        throw createError({ statusCode: 500, message: `Failed to save ${name} URL: ${urlUpdateError.message}` })
    }
  }

  return { success: true, message: 'Settings updated successfully.' }
})
