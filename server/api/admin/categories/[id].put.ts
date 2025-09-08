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
  const { name, is_public } = await readBody(event)

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    })
  }

  const updateData: { name?: string; is_public?: boolean } = {}
  if (name && typeof name === 'string') {
    updateData.name = name.trim()
  }
  if (typeof is_public === 'boolean') {
    // Check if the category is being unpublished
    if (is_public === false) {
      // First, get the current state of the category
      const { data: currentCategory, error: fetchError } = await client
        .from('categories')
        .select('is_public')
        .eq('id', categoryId)
        .single()

      if (fetchError || !currentCategory) {
        throw createError({ statusCode: 404, statusMessage: 'Category not found' })
      }

      // Proceed with the check only if the category is currently public
      if (currentCategory.is_public) {
        const { count, error: countError } = await client
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryId)

        if (countError) {
          throw createError({ statusCode: 500, statusMessage: 'Failed to check product usage' })
        }

        if (count && count > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'このカテゴリは商品に利用されているため、非公開にできません。',
          })
        }
      }
    }
    updateData.is_public = is_public
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No update data provided',
    })
  }

  const { data, error } = await client
    .from('categories')
    .update(updateData)
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
