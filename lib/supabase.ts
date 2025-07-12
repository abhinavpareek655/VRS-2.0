import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (bypasses RLS) - only created if service key is available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          category_id: string | null
          name: string
          brand: string
          model: string
          year: number
          type: "car" | "bike"
          price_per_day: number
          fuel_type: string | null
          transmission: string | null
          seats: number | null
          features: string[] | null
          images: string[] | null
          location: string
          available: boolean | null
          created_at: string
          updated_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          pickup_location: string
          pickup_date: string
          return_date: string
          total_days: number
          total_amount: number
          status: "pending" | "confirmed" | "active" | "completed" | "cancelled"
          payment_status: "pending" | "paid" | "failed" | "refunded"
          payment_id: string | null
          special_requests: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          pickup_location: string
          pickup_date: string
          return_date: string
          total_days: number
          total_amount: number
          status?: "pending" | "confirmed" | "active" | "completed" | "cancelled"
          payment_status?: "pending" | "paid" | "failed" | "refunded"
          payment_id?: string | null
          special_requests?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
      }
    }
  }
}
