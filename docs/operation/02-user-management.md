## 管理者権限の付与

本アプリケーションの管理者権限は、セキュリティを担保するため、SupabaseのSQL Editorを使用して手動で付与します。

#### 手順

1.  **Supabaseプロジェクト > SQL Editor** に移動します。
2.  「New query」を作成し、以下のSQLを実行します。
3.  `'【対象のメールアドレス】'` の部分を、権限を付与したいユーザーのメールアドレスに書き換えてください。

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"claims_admin": true}'
WHERE email = '【対象のメールアドレス】';
```

実行後、対象ユーザーは一度ログアウトし、再ログインすることで管理者権限が有効になります。