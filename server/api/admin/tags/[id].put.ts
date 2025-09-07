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
  const tagId = event.context.params?.id
  const { name } = await readBody(event)

  if (!tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tag ID is required',
    })
  }

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tag name is required',
    })
  }

  const { data, error } = await client
    .from('tags')
    .update({ name: name.trim() })
    .eq('id', tagId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating tag ${tagId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update tag',
    })
  }

  return data
})
