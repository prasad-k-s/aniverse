/**
 * Database types for the Supabase client, matching supabase/schema.sql.
 * (Normally generated with `supabase gen types typescript`; kept by hand here
 * so the project builds without the Supabase CLI.)
 */

export type WatchStatus = 'watching' | 'completed' | 'planning' | 'paused' | 'dropped'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          user_id: string
          anime_id: number
          status: WatchStatus
          progress: number
          score: number | null
          title: string
          cover_image: string | null
          episodes: number | null
          format: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          anime_id: number
          status?: WatchStatus
          progress?: number
          score?: number | null
          title: string
          cover_image?: string | null
          episodes?: number | null
          format?: string | null
          updated_at?: string
        }
        Update: {
          status?: WatchStatus
          progress?: number
          score?: number | null
          title?: string
          cover_image?: string | null
          episodes?: number | null
          format?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'watchlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: number
          user_id: string
          anime_id: number
          anime_title: string
          rating: number
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          anime_id: number
          anime_title: string
          rating: number
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          body?: string
          anime_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      comments: {
        Row: {
          id: number
          user_id: string
          anime_id: number
          body: string
          created_at: string
        }
        Insert: {
          user_id: string
          anime_id: number
          body: string
          created_at?: string
        }
        Update: {
          body?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      watch_status: WatchStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type WatchlistEntry = Database['public']['Tables']['watchlist']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type Author = Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
export type ReviewWithAuthor = Review & { profiles: Author | null }
export type CommentWithAuthor = Comment & { profiles: Author | null }
