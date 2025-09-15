import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user || user.app_metadata?.claims_admin !== true) {
    throw createError({ statusCode: 401, message: 'Unauthorized: Admin access required' })
  }

  const client = await serverSupabaseClient<Database>(event)
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, message: 'No form data received' })
  }

  const settingsToUpdate: { key: string; value: string }[] = []

  // Process text fields first
  formData.forEach(part => {
    if (part.name && !part.filename && part.data) {
      settingsToUpdate.push({ key: part.name, value: part.data.toString('utf-8') })
    }
  })

  // Upsert text-based settings first
  if (settingsToUpdate.length > 0) {
    const { error: dbError } = await client.from('site_settings').upsert(settingsToUpdate)
    if (dbError) {
      console.error('Error saving text settings:', dbError)
      throw createError({ statusCode: 500, message: 'Failed to save settings' })
    }
  }

  // Handle file uploads and update their URLs
  const fileParts = formData.filter(p => p.filename && (p.name === 'logo' || p.name === 'favicon'))

  for (const filePart of fileParts) {
    const { name, data, type, filename } = filePart
    if (!name || !data || !type || !filename) continue

    // Use a consistent naming convention, e.g., site/logo.png
    const fileExt = filename.split('.').pop()
    const filePath = `site/${name}.${fileExt}`

    const { error: uploadError } = await client.storage
      .from('assets')
      .upload(filePath, data, {
        contentType: type,
        upsert: true, // Overwrite if exists
      })

    if (uploadError) {
      console.error(`Error uploading ${name}:`, uploadError)
      throw createError({ statusCode: 500, message: `Failed to upload ${name}` })
    }

    const { data: { publicUrl } } = client.storage.from('assets').getPublicUrl(filePath)

    const urlKey = `${name}_url`
    const { error: urlUpdateError } = await client.from('site_settings').upsert({ key: urlKey, value: publicUrl })

    if (urlUpdateError) {
        console.error(`Error saving ${urlKey}:`, urlUpdateError)
        throw createError({ statusCode: 500, message: `Failed to save ${name} URL` })
    }
  }

  return { success: true, message: 'Settings updated successfully.' }
})
