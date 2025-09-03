import ja from './locales/ja.ts'
import en from './locales/en.ts'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ja',
  messages: {
    ja,
    en
  }
}))