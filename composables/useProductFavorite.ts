import { useFavorites } from '~/composables/useFavorites'
import type { MaybeRef } from 'vue'

export const useProductFavorite = (productId: MaybeRef<number | undefined>) => {
  const { user } = useCurrentUser()
  const { isFavorited, addFavorite, removeFavorite } = useFavorites()
  const id = toValue(productId)

  const { data: isFavoritedState } = useAsyncData(
    `product-favorite-${id}`,
    async () => {
      // Ensure user and id are available before fetching
      if (!user.value || !id) {
        return false
      }
      return await isFavorited(id)
    },
    {
      watch: [user],
      default: () => false,
    }
  )

  const toggleFavorite = async () => {
    if (!user.value) {
      alert('Please log in to favorite items.')
      return
    }
    // Ensure id is valid and state is not null
    if (!id || isFavoritedState.value === null) return

    const newState = !isFavoritedState.value
    isFavoritedState.value = newState

    try {
      if (newState) {
        await addFavorite(id)
      } else {
        await removeFavorite(id)
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e)
      // revert on error
      isFavoritedState.value = !newState
    }
  }

  return {
    isFavoritedState,
    toggleFavorite,
  }
}
