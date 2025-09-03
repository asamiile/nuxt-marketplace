// This plugin is designed to address a race condition when using Supabase auth.
// On client-side navigation, the auth middleware might run before the Supabase
// client has finished initializing and restoring the user session from localStorage.
// By explicitly calling getSession() in a client-side plugin, we ensure that
// the user's session is loaded before the rest of the app proceeds.
// See: https://github.com/nuxt-modules/supabase/issues/496

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // If there's no session and the user is on a protected route, the middleware will handle redirection.
    // This plugin's job is just to ensure the session is loaded.
    // You could potentially add more logic here if needed, for example, to handle session refresh.
  } catch (error) {
    console.error('Error getting session in supabase-auth plugin:', error)
  }
})
