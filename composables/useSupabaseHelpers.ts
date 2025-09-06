import { useSupabaseClient } from '#imports'

export const useSupabaseHelpers = () => {
  const supabase = useSupabaseClient()

  const getPathFromUrl = (url: string | null): string | null => {
    if (!url) return null
    try {
      const { pathname } = new URL(url)
      // "assets" バケット名の次に来る部分をパスとして抽出するように修正
      const path = pathname.substring(pathname.indexOf('/assets/') + '/assets/'.length)
      return path
    } catch (error) {
      console.error('Invalid URL for path extraction:', error)
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
