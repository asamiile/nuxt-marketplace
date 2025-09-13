import { createClient, type User } from '@supabase/supabase-js'
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

  // Create a new client with the service_role key to bypass RLS
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)

  // auth.usersから全ユーザー情報を取得
  const { data: usersData, error: usersError } = await client.auth.admin.listUsers()
  if (usersError) {
    console.error('Error fetching users:', usersError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch users' })
  }

  // profilesテーブルから全プロフィール情報を取得
  const { data: profiles, error: profilesError } = await client.from('profiles').select('*')
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch profiles' })
  }

  // プロフィール情報をidをキーにしたMapに変換
  const profilesMap = new Map(profiles.map(p => [p.id, p]))

  // ユーザー情報とプロフィール情報を結合
  const combinedUsers = usersData.users.map((user: User) => {
    const profile = profilesMap.get(user.id)
    return {
      ...user,
      ...profile, // username, avatar_urlなどを追加
      is_admin: user.app_metadata?.claims_admin === true,
    }
  })

  return combinedUsers
})
