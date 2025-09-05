export interface Product {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  file_url: string | null;
  creator_id: string;
  category_id: number | null;
  license_type: string | null;
  terms_of_use: string | null;
  profiles: {
    username: string | null;
  } | null;
}

export interface ProductWithRelations extends Product {
  categories: {
    name: string;
  } | null;
  tags: {
    name: string;
  }[];
}
