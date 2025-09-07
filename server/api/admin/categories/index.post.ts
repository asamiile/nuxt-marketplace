import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const { name } = await readBody(event)

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required',
    })
  }

  const { data, error } = await client
    .from('categories')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create category',
    })
  }

  return data
})
