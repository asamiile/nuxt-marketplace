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

  if (!tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tag ID is required',
    })
  }

  const { error } = await client
    .from('tags')
    .delete()
    .eq('id', tagId)

  if (error) {
    console.error(`Error deleting tag ${tagId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete tag',
    })
  }

  return { status: 204, statusText: 'No Content' }
})
