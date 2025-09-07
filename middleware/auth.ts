const protectedRoutes = [
  '/dashboard',
  '/sell',
  '/favorites',
  '/product/edit'
]

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // protectedRoutesに含まれるパスのいずれかで始まる場合のみチェック
  if (protectedRoutes.some(path => to.path.startsWith(path))) {
    if (!user.value) {
      return navigateTo('/login')
    }
  }
})
