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
      stores: {
        Row: {
          id: number
          created_at: string
          name: string
          address: string | null
          region: string | null
          zip: string | null
          image_url: string | null
          maps_url: string | null
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          address?: string | null
          region?: string | null
          zip?: string | null
          image_url?: string | null
          maps_url?: string | null
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          address?: string | null
          region?: string | null
          zip?: string | null
          image_url?: string | null
          maps_url?: string | null
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
        }
      }
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string | null
          category: string | null
          brand: string | null
          image_url: string | null
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description?: string | null
          category?: string | null
          brand?: string | null
          image_url?: string | null
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string | null
          category?: string | null
          brand?: string | null
          image_url?: string | null
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
        }
      }
      prices: {
        Row: {
          id: number
          created_at: string
          product_id: number
          store_id: number
          price: number
          date_observed: string
          on_sale: boolean
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          product_id: number
          store_id: number
          price: number
          date_observed?: string
          on_sale?: boolean
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          product_id?: number
          store_id?: number
          price?: number
          date_observed?: string
          on_sale?: boolean
          user_id?: string
        }
      }
      regions: {
        Row: {
          id: number
          created_at: string
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          user_id: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}