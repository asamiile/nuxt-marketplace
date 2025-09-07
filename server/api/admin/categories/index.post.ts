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
