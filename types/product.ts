export interface Product {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  file_url: string | null;
  creator_id: string;
  license_type: string | null;
  terms_of_use: string | null;
  profiles: {
    username: string | null;
  } | null;
}
