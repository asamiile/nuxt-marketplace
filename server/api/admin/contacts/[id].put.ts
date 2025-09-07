import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const contactId = event.context.params?.id

  if (!contactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contact ID is required',
    })
  }

  const { data, error } = await client
    .from('contacts')
    .update({ is_read: true })
    .eq('id', contactId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating contact ${contactId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update contact',
    })
  }

  return data
})
