import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
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
