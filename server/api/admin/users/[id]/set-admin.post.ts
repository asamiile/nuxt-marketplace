import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Supabase configuration missing.',
    })
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
  const userIdToUpdate = event.context.params?.id as string
  const body = await readBody(event)
  const { isAdmin } = body

  if (typeof isAdmin !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body: isAdmin must be a boolean' })
  }

  // If we are demoting a user, check if they are the last admin
  if (isAdmin === false) {
    const { data: usersData, error: listError } = await client.auth.admin.listUsers()
    if (listError) {
      throw createError({ statusCode: 500, statusMessage: 'Could not list users to check for last admin' })
    }

    const admins = usersData.users.filter(u => u.app_metadata?.claims_admin === true)

    if (admins.length === 1 && admins[0].id === userIdToUpdate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot demote the last admin account.',
      })
    }
  }

  // Update the user's custom claim
  const { data, error } = await client.auth.admin.updateUserById(
    userIdToUpdate,
    { app_metadata: { claims_admin: isAdmin } }
  )

  if (error) {
    console.error('Error updating admin status:', error)
    throw createError({ statusCode: 500, statusMessage: `Failed to update admin status: ${error.message}` })
  }

  return { success: true, user: data.user }
})
