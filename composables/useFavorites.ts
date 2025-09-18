import { ref } from 'vue'
import type { Product } from '~/types/product'

// --- Shared State ---
// By defining state outside the composable function, it becomes a singleton
// and is shared across all components that use this composable.
const favorites = ref<any[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
const itemsPerPage = 8
const currentPage = ref(1)
const totalPages = ref(1)
// --- End Shared State ---

export const useFavorites = () => {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()

  // Check if a specific product is favorited
  const isFavorited = async (productId: number) => {
    if (!user.value) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Error checking favorite status:', error)
      return false
    }

    return data && data.length > 0
  }

  // Add a product to favorites
  const addFavorite = async (productId: number) => {
    if (!user.value) return

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.value.id,
        product_id: productId,
      })

    if (error) {
      console.error('Error adding to favorites:', error)
    } else {
        // Refresh the current page of favorites after adding a new one
        fetchFavoriteProducts()
    }
  }

  // Remove a product from favorites
  const removeFavorite = async (productId: number) => {
    if (!user.value) return

    // Optimistic UI update
    const initialFavorites = [...favorites.value]
    const productIndex = favorites.value.findIndex(p => p.id === productId)
    if (productIndex > -1) {
      favorites.value.splice(productIndex, 1)
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.value.id)
        .eq('product_id', productId)

      if (error) throw error

      // On success, refetch to ensure pagination and total count are correct
      await fetchFavoriteProducts()
    } catch (err) {
      // Revert on error
      favorites.value = initialFavorites
      console.error('Error removing from favorites:', err)
      // Optionally, show a toast to the user
    }
  }

  // Fetch all favorited products for the current user
  const fetchFavoriteProducts = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null
    try {
      // First, get the total count of favorites
      const { count, error: countError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id)

      if (countError) throw countError

      totalPages.value = count ? Math.ceil(count / itemsPerPage) : 1

      // Then, fetch the products for the current page
      const from = (currentPage.value - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, error: dbError } = await supabase
        .from('favorites')
        .select('product:products(*, profiles(username))') // Fetch related product data and creator profile
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (dbError) throw dbError

      // The result is an array of objects like { product: ProductWithProfile }, so we map it
      favorites.value = data?.map(fav => fav.product).filter(p => p !== null) as Product[]

    } catch (err: any) {
      console.error('Error fetching favorite products:', err)
      error.value = err
      favorites.value = []
    } finally {
      loading.value = false
    }
  }


  return {
    favorites,
    loading,
    error,
    currentPage,
    totalPages,
    isFavorited,
    addFavorite,
    removeFavorite,
    fetchFavoriteProducts,
  }
}
