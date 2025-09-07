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
  const categoryId = event.context.params?.id

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    })
  }

  const { error } = await client
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error(`Error deleting category ${categoryId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete category',
    })
  }

  return { status: 204, statusText: 'No Content' }
})
