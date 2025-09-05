export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()

  // Wait for user to be fetched
  if (!user.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const isAdmin = user.value?.app_metadata?.claims_admin === true

  if (!isAdmin) {
    console.log('User is not an admin, redirecting.')
    return navigateTo('/')
  }
})
