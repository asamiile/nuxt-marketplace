## ファイルストレージの構成

Supabase Storageは、assetsという単一の公開バケットを使用しています。バケット内は、以下のフォルダ構成でファイルが管理されます。

- プロフィール画像: `avatars/[user_id]`
- 商品関連ファイル: `products/[user_id]/[product_uuid]/`

```html
assets/
├── avatars/
│   └── [user_id]/avatar.jpg
└── products/
    └── [user_id]/
        └── [product_uuid]/
            ├── image.jpg
            └── asset.zip
```