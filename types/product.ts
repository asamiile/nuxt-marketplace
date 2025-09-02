export interface Product {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  file_url: string | null;
  creator_id: string;
  profiles: {
    username: string | null;
  } | null;
}
