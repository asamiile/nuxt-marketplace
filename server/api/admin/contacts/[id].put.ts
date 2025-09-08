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
  const contactId = event.context.params?.id

  if (!contactId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Contact ID is required',
    })
  }

  const { status } = await readBody(event)

  if (!status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status is required',
    })
  }

  // バリデーション: statusが許可された値のいずれかであることを確認
  const allowedStatuses = ['未対応', '対応中', '対応済み']
  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid status value. Must be one of: ${allowedStatuses.join(', ')}`,
    })
  }

  const { data, error } = await client
    .from('contacts')
    .update({ status })
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
