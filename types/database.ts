// This file can be generated automatically by Supabase CLI:
// npx supabase gen types typescript --project-id <your-project-id> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
        }
      }
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          file_url: string | null
          creator_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          file_url?: string | null
          creator_id: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          file_url?: string | null
          creator_id?: string
        }
      }
      purchases: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          product_id: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          product_id: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          product_id?: number;
        };
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Custom type aliases for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Purchase = Database['public']['Tables']['purchases']['Row'];
