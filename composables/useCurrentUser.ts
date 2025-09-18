import { computed } from 'vue'
import { useSupabaseUser } from '#imports'

export const useCurrentUser = () => {
  const user = useSupabaseUser()

  const isAdmin = computed(() => {
    if (!user.value) {
      return false
    }
    // Access app_metadata which is not directly on the User type, but is where custom claims are stored.
    // Supabase docs suggest this is the location for custom claims set via hooks.
    // We need to cast to `any` to access this property.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = (user.value as any).app_metadata
    return metadata?.claims_admin === true
  })

  return {
    user,
    isAdmin,
  }
}
