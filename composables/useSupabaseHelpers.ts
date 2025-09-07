import { useSupabaseClient } from '#imports'

export const useSupabaseHelpers = () => {
  const supabase = useSupabaseClient()

  const getPathFromUrl = (url: string | null): string | null => {
    if (!url) return null
    try {
      const { pathname } = new URL(url)
      const assetsMarker = '/assets/'
      const assetsIndex = pathname.indexOf(assetsMarker)

      if (assetsIndex === -1) {
        // This is not a Supabase asset URL we can process.
        return null
      }
      // Extract the path after "/assets/"
      return pathname.substring(assetsIndex + assetsMarker.length)
    } catch (error) {
      // Invalid URL will throw an error
      console.error('Invalid URL provided to getPathFromUrl:', url, error)
      return null
    }
  }

  const getOptimizedPublicUrl = (path: string | null, options: { width: number; height: number; resize?: 'cover' | 'contain' | 'fill' }) => {
    if (!path) {
      return null
    }
    const { data } = supabase.storage.from('assets').getPublicUrl(path, {
      transform: {
        ...options,
        resize: options.resize || 'cover',
      },
    })
    return data.publicUrl
  }

  return {
    getPathFromUrl,
    getOptimizedPublicUrl,
  }
}
