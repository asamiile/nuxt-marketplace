export const useFormatters = () => {
  /**
   * 数値を日本円の通貨形式の文字列に変換します。
   * @param price - 変換する数値。nullまたは数値でない場合は 'N/A' を返します。
   * @returns - フォーマットされた通貨文字列 (例: "￥1,234") または 'N/A'。
   */
  const formatPrice = (price: number | null) => {
    if (price === null || isNaN(price)) {
      return 'N/A'
    }
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }

  /**
   * Dateオブジェクトまたは日付文字列を 'YYYY/MM/DD' 形式にフォーマットします。
   * @param date - 変換するDateオブジェクトまたは日付文字列。
   * @returns - 'YYYY/MM/DD' 形式の文字列。無効な入力の場合は空文字列を返します。
   */
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) {
      return ''
    }
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return ''
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  return {
    formatPrice,
    formatDate,
  }
}
