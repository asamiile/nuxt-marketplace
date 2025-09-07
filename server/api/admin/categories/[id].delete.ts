import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
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
