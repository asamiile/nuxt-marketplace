export const useSupabaseHelpers = () => {
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

  return {
    getPathFromUrl,
  }
}
