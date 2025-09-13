import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const userId = event.context.params?.id as string

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const { disable } = await readBody(event)

  if (typeof disable !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body: disable must be a boolean' })
  }

  const { error } = await client.auth.admin.updateUserById(userId, {
    ban_duration: disable ? '365d' : 'none',
  })

  if (error) {
    console.error(`Error updating user ban duration ${userId}:`, error)
    throw createError({ statusCode: 500, statusMessage: `Failed to update user: ${error.message}` })
  }

  // ユーザー情報を再取得して、banned_untilが設定されているか確認
  const { data: { user } } = await client.auth.admin.getUserById(userId)

  return { success: true, banned_until: user?.banned_until }
})
