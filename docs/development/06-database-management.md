# 6. データベース管理

このドキュメントでは、プロジェクトのデータベーススキーマ、マイグレーション、およびカスタムデータベース関数（RPC）について説明します。

## スキーマとマイグレーション

データベースのスキーマ定義と変更履歴は `supabase/migrations` ディレクトリに保存されています。新しいスキーマ変更やテーブル作成を行う場合は、Supabase CLIを使用して新しいマイグレーションファイルを作成してください。

```bash
# 新しいマイグレーションファイルを作成
supabase migration new <migration_name>
```

## データベース関数 (RPC)

複雑なデータ操作やトランザクションを必要とする処理は、PostgreSQLの関数として実装し、RPC（Remote Procedure Call）としてフロントエンドから呼び出します。これにより、フロントエンドのロジックが簡素化され、セキュリティが向上します。

### 商品登録関数 `create_product`

新しい商品をデータベースに登録するための関数です。商品の基本情報とタグ名を引数として受け取り、`products` テーブルへの挿入と `product_tags` テーブルへの関連付けをトランザクション内で実行します。

-   **関数名:** `create_product`
-   **引数:**
    -   `p_name` (TEXT): 商品名
    -   `p_description` (TEXT): 商品説明
    -   `p_price` (NUMERIC): 価格
    -   `p_category_id` (BIGINT): カテゴリID
    -   `p_image_url` (TEXT): サムネイル画像のURL
    -   `p_file_url` (TEXT): デジタルアセットファイルのURL
    -   `p_license_type` (TEXT): ライセンスの種類
    -   `p_terms_of_use` (TEXT): 利用規約
    -   `p_tag_names` (TEXT[]): タグ名の配列
-   **戻り値:** 作成された商品のID (BIGINT)
-   **フロントエンドからの呼び出し例:**
    ```typescript
    const { data, error } = await supabase.rpc('create_product', {
      p_name: '新しい商品',
      p_description: '商品の説明です。',
      p_price: 1000,
      p_category_id: 1,
      p_image_url: '...',
      p_file_url: '...',
      p_license_type: 'Standard',
      p_terms_of_use: '商用利用可',
      p_tag_names: ['イラスト', '可愛い']
    });
    ```

### 商品更新関数 `update_product`

既存の商品情報を更新するための関数です。商品のIDと更新後の情報を引数として受け取り、`products` テーブルの更新と `product_tags` の再設定をトランザクション内で実行します。この関数を呼び出すと、商品のステータスは `pending` にリセットされ、管理者による再承認が必要となります。

-   **関数名:** `update_product`
-   **引数:**
    -   `p_product_id` (BIGINT): 更新対象の商品ID
    -   `p_name` (TEXT): 商品名
    -   `p_description` (TEXT): 商品説明
    -   `p_price` (NUMERIC): 価格
    -   `p_category_id` (BIGINT): カテゴリID
    -   `p_image_url` (TEXT): サムネイル画像のURL
    -   `p_file_url` (TEXT): デジタルアセットファイルのURL
    -   `p_license_type` (TEXT): ライセンスの種類
    -   `p_terms_of_use` (TEXT): 利用規約
    -   `p_tag_ids` (BIGINT[]): タグIDの配列
-   **戻り値:** `void`
-   **フロントエンドからの呼び出し例:**
    ```typescript
    const { error } = await supabase.rpc('update_product', {
      p_product_id: 123, // 更新する商品のID
      p_name: '更新された商品名',
      p_description: '更新された商品説明',
      p_price: 1500,
      p_category_id: 2,
      p_image_url: '...',
      p_file_url: '...',
      p_license_type: 'Extended',
      p_terms_of_use: '商用利用、改変可',
      p_tag_ids: [1, 5, 8] // 関連付けるタグのID配列
    });
    ```
