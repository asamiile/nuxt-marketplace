import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
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
