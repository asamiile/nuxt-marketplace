import { describe, it, expect } from 'vitest'
import { useErrorTranslator } from '~/composables/useErrorTranslator'

describe('useErrorTranslator', () => {
  const { translateError } = useErrorTranslator()

  it('should translate "New password should be different from the old password."', () => {
    const message = 'New password should be different from the old password.'
    const expected = '新しいパスワードは、古いパスワードと異なる必要があります。'
    expect(translateError(message)).toBe(expected)
  })

  it('should translate "Unable to validate email address: invalid format"', () => {
    const message = 'Unable to validate email address: invalid format'
    const expected = 'メールアドレスの形式が正しくありません。'
    expect(translateError(message)).toBe(expected)
  })

  it('should translate "User already registered"', () => {
    const message = 'User already registered'
    const expected = 'このメールアドレスは既に使用されています。'
    expect(translateError(message)).toBe(expected)
  })

  it('should translate "Invalid login credentials"', () => {
    const message = 'Invalid login credentials'
    const expected = 'メールアドレスまたはパスワードが正しくありません。'
    expect(translateError(message)).toBe(expected)
  })

  it('should translate "Email not confirmed"', () => {
    const message = 'Email not confirmed'
    const expected = 'メールアドレスの確認が完了していません。受信したメールのリンクをクリックしてください。'
    expect(translateError(message)).toBe(expected)
  })

  it('should return the original message if no translation is available', () => {
    const message = 'An unknown error occurred.'
    expect(translateError(message)).toBe(message)
  })
})
