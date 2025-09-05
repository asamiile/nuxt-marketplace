export const useSupabaseHelpers = () => {
  const getPathFromUrl = (url: string | null): string | null => {
    if (!url) return null
    try {
      const { pathname } = new URL(url)
      // Supabase StorageのURL構造に合わせてパスを調整
      // e.g. https://<project>.supabase.co/storage/v1/object/public/assets/products/image.jpg
      // -> products/image.jpg
      const path = pathname.split('/assets/')[1]
      return path
    } catch (error) {
      console.error('Invalid URL provided to getPathFromUrl:', url, error)
      return null
    }
  }

  return {
    getPathFromUrl,
  }
}
