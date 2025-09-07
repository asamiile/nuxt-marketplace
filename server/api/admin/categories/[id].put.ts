import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const categoryId = event.context.params?.id
  const { name } = await readBody(event)

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    })
  }

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required',
    })
  }

  const { data, error } = await client
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating category ${categoryId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update category',
    })
  }

  return data
})
