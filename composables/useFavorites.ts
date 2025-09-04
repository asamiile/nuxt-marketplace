import { ref, computed } from 'vue'
import type { Product } from '~/types/product'

export const useFavorites = () => {
  const supabase = useSupabaseClient()
  const user = useCurrentUser()

  const favorites = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Check if a specific product is favorited
  const isFavorited = async (productId: number) => {
    if (!user.value) return false

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: "No rows found" which is not an error here
      console.error('Error checking favorite status:', error)
      return false
    }

    return !!data
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
    }
  }

  // Remove a product from favorites
  const removeFavorite = async (productId: number) => {
    if (!user.value) return

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.value.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  // Fetch all favorited products for the current user
  const fetchFavoriteProducts = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null
    try {
      const { data, error: dbError } = await supabase
        .from('favorites')
        .select('product:products(*, profiles(username))') // Fetch related product data and creator profile
        .eq('user_id', user.value.id)

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
    isFavorited,
    addFavorite,
    removeFavorite,
    fetchFavoriteProducts,
  }
}
