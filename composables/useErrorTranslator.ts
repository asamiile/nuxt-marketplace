export const useErrorTranslator = () => {
  const translateError = (message: string): string => {
    switch (message) {
      case 'New password should be different from the old password.':
        return '新しいパスワードは、古いパスワードと異なる必要があります。'
      case 'Unable to validate email address: invalid format':
        return 'メールアドレスの形式が正しくありません。'
      case 'User already registered':
        return 'このメールアドレスは既に使用されています。'
      case 'Invalid login credentials':
        return 'メールアドレスまたはパスワードが正しくありません。'
      case 'Email not confirmed':
        return 'メールアドレスの確認が完了していません。受信したメールのリンクをクリックしてください。'
      // Add more translations as needed
      default:
        return message
    }
  }

  return {
    translateError,
  }
}
