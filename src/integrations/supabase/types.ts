export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_assets: {
        Row: {
          alt_text: string | null
          campaign_id: string
          created_at: string
          display_order: number | null
          file_name: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          campaign_id: string
          created_at?: string
          display_order?: number | null
          file_name: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          campaign_id?: string
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaign_slots: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_enabled: boolean | null
          priority: number | null
          slot_id: string
          weight: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          slot_id: string
          weight?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          priority?: number | null
          slot_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaign_slots_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_campaign_slots_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "ad_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaigns: {
        Row: {
          advertiser: string | null
          created_at: string
          created_by: string | null
          daily_window_end: string | null
          daily_window_start: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          placement_type: string
          start_date: string
          status: string
          target_url: string | null
          updated_at: string
        }
        Insert: {
          advertiser?: string | null
          created_at?: string
          created_by?: string | null
          daily_window_end?: string | null
          daily_window_start?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          placement_type: string
          start_date: string
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          advertiser?: string | null
          created_at?: string
          created_by?: string | null
          daily_window_end?: string | null
          daily_window_start?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          placement_type?: string
          start_date?: string
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ad_metrics: {
        Row: {
          asset_id: string | null
          campaign_id: string
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          campaign_id: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          campaign_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_metrics_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "ad_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ad_slots: {
        Row: {
          allowed_formats: string[] | null
          code: string
          created_at: string
          height: number | null
          hide_if_empty: boolean | null
          id: string
          is_enabled: boolean | null
          name: string
          page_type: string
          updated_at: string
          width: number | null
        }
        Insert: {
          allowed_formats?: string[] | null
          code: string
          created_at?: string
          height?: number | null
          hide_if_empty?: boolean | null
          id?: string
          is_enabled?: boolean | null
          name: string
          page_type?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          allowed_formats?: string[] | null
          code?: string
          created_at?: string
          height?: number | null
          hide_if_empty?: boolean | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          page_type?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      agent_artists: {
        Row: {
          agent_profile_id: string
          artist_profile_id: string
          contract_notes: string | null
          created_at: string
          id: string
          representation_status:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at: string | null
          responded_at: string | null
        }
        Insert: {
          agent_profile_id: string
          artist_profile_id: string
          contract_notes?: string | null
          created_at?: string
          id?: string
          representation_status?:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at?: string | null
          responded_at?: string | null
        }
        Update: {
          agent_profile_id?: string
          artist_profile_id?: string
          contract_notes?: string | null
          created_at?: string
          id?: string
          representation_status?:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at?: string | null
          responded_at?: string | null
        }
        Relationships: []
      }
      annonces: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          deadline: string | null
          description: string
          event_date: string | null
          event_id: string | null
          genres: string[] | null
          id: string
          image_position_y: number | null
          image_url: string | null
          location: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["annonce_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline?: string | null
          description: string
          event_date?: string | null
          event_id?: string | null
          genres?: string[] | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["annonce_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline?: string | null
          description?: string
          event_date?: string | null
          event_id?: string | null
          genres?: string[] | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["annonce_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          annonce_id: string
          applicant_id: string
          created_at: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          annonce_id: string
          applicant_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          annonce_id?: string
          applicant_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_annonce_id_fkey"
            columns: ["annonce_id"]
            isOneToOne: false
            referencedRelation: "annonces"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_radio_subscriptions: {
        Row: {
          artist_profile_id: string
          auto_approve_tracks: boolean
          created_at: string
          credits_remaining: number
          expires_at: string | null
          id: string
          is_active: boolean
          priority_boost: number
          starts_at: string
          subscription_type: string
          updated_at: string
        }
        Insert: {
          artist_profile_id: string
          auto_approve_tracks?: boolean
          created_at?: string
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority_boost?: number
          starts_at?: string
          subscription_type: string
          updated_at?: string
        }
        Update: {
          artist_profile_id?: string
          auto_approve_tracks?: boolean
          created_at?: string
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority_boost?: number
          starts_at?: string
          subscription_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_radio_subscriptions_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          artist_profile_id: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["availability_status"]
          updated_at: string
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          blocker_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_position_y: number | null
          image_url: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          artist_profile_id: string
          created_at: string
          event_id: string
          id: string
          message: string | null
          proposed_fee: number | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          venue_profile_id: string
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          event_id: string
          id?: string
          message?: string | null
          proposed_fee?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          venue_profile_id: string
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          event_id?: string
          id?: string
          message?: string | null
          proposed_fee?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          venue_profile_id?: string
        }
        Relationships: []
      }
      conversation_archives: {
        Row: {
          archived_at: string
          conversation_id: string
          user_id: string
        }
        Insert: {
          archived_at?: string
          conversation_id: string
          user_id: string
        }
        Update: {
          archived_at?: string
          conversation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_archives_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_pins: {
        Row: {
          conversation_id: string
          pinned_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          pinned_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          pinned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_pins_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          reply_received: boolean | null
          title: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          reply_received?: boolean | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          reply_received?: boolean | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      detailed_reviews: {
        Row: {
          comment: string | null
          communication_score: number
          created_at: string
          id: string
          overall_average: number | null
          professionalism_score: number
          reviewed_profile_id: string
          reviewer_id: string
          talent_score: number
        }
        Insert: {
          comment?: string | null
          communication_score: number
          created_at?: string
          id?: string
          overall_average?: number | null
          professionalism_score: number
          reviewed_profile_id: string
          reviewer_id: string
          talent_score: number
        }
        Update: {
          comment?: string | null
          communication_score?: number
          created_at?: string
          id?: string
          overall_average?: number | null
          professionalism_score?: number
          reviewed_profile_id?: string
          reviewer_id?: string
          talent_score?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          genres: string[] | null
          id: string
          image_position_y: number | null
          image_url: string | null
          location: string | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          venue_profile_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          genres?: string[] | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          location?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          venue_profile_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          genres?: string[] | null
          id?: string
          image_position_y?: number | null
          image_url?: string | null
          location?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          venue_profile_id?: string
        }
        Relationships: []
      }
      manager_artists: {
        Row: {
          artist_profile_id: string
          contract_notes: string | null
          created_at: string
          id: string
          manager_profile_id: string
          representation_status:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at: string | null
          responded_at: string | null
        }
        Insert: {
          artist_profile_id: string
          contract_notes?: string | null
          created_at?: string
          id?: string
          manager_profile_id: string
          representation_status?:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at?: string | null
          responded_at?: string | null
        }
        Update: {
          artist_profile_id?: string
          contract_notes?: string | null
          created_at?: string
          id?: string
          manager_profile_id?: string
          representation_status?:
            | Database["public"]["Enums"]["representation_status"]
            | null
          requested_at?: string | null
          responded_at?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          profile_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_url: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          profile_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: []
      }
      message_receipts: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_receipts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepts_direct_contact: boolean | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          email: string | null
          experience: string | null
          genres: string[] | null
          header_position_y: number | null
          header_url: string | null
          id: string
          instagram_url: string | null
          is_public: boolean
          languages: string[] | null
          location: string | null
          phone: string | null
          preferred_contact_profile_id: string | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          soundcloud_url: string | null
          spotify_url: string | null
          talents: string[] | null
          tiktok_url: string | null
          updated_at: string
          user_id: string
          venue_capacity: number | null
          venue_category: string | null
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          accepts_direct_contact?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          languages?: string[] | null
          location?: string | null
          phone?: string | null
          preferred_contact_profile_id?: string | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string
          user_id: string
          venue_capacity?: number | null
          venue_category?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          accepts_direct_contact?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean
          languages?: string[] | null
          location?: string | null
          phone?: string | null
          preferred_contact_profile_id?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string
          user_id?: string
          venue_capacity?: number | null
          venue_category?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_preferred_contact_profile"
            columns: ["preferred_contact_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_likes: {
        Row: {
          created_at: string
          id: string
          media_asset_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_asset_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_asset_id?: string
          user_id?: string
        }
        Relationships: []
      }
      radio_play_history: {
        Row: {
          completed: boolean
          duration_seconds: number | null
          id: string
          media_asset_id: string
          played_at: string
          playlist_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          media_asset_id: string
          played_at?: string
          playlist_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          media_asset_id?: string
          played_at?: string
          playlist_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radio_play_history_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_play_history_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "radio_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_playlist_tracks: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          is_approved: boolean
          last_played_at: string | null
          media_asset_id: string
          play_count: number
          playlist_id: string
          weight: number
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          is_approved?: boolean
          last_played_at?: string | null
          media_asset_id: string
          play_count?: number
          playlist_id: string
          weight?: number
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          is_approved?: boolean
          last_played_at?: string | null
          media_asset_id?: string
          play_count?: number
          playlist_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "radio_playlist_tracks_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radio_playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "radio_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_playlists: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          schedule_end: string | null
          schedule_start: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          schedule_end?: string | null
          schedule_start?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          schedule_end?: string | null
          schedule_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_profile_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_profile_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_profile_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewed_profile_id_fkey"
            columns: ["reviewed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          area: string | null
          audience: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["roadmap_priority"]
          sort_order: number | null
          status: Database["public"]["Enums"]["roadmap_item_status"]
          title: string
          type: Database["public"]["Enums"]["roadmap_item_type"]
          updated_at: string
        }
        Insert: {
          area?: string | null
          audience?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["roadmap_priority"]
          sort_order?: number | null
          status?: Database["public"]["Enums"]["roadmap_item_status"]
          title: string
          type: Database["public"]["Enums"]["roadmap_item_type"]
          updated_at?: string
        }
        Update: {
          area?: string | null
          audience?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["roadmap_priority"]
          sort_order?: number | null
          status?: Database["public"]["Enums"]["roadmap_item_status"]
          title?: string
          type?: Database["public"]["Enums"]["roadmap_item_type"]
          updated_at?: string
        }
        Relationships: []
      }
      site_ticker_messages: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_artist_history: {
        Row: {
          artist_profile_id: string
          created_at: string
          description: string | null
          event_title: string | null
          id: string
          is_visible: boolean
          performance_date: string | null
          updated_at: string
          venue_profile_id: string
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          description?: string | null
          event_title?: string | null
          id?: string
          is_visible?: boolean
          performance_date?: string | null
          updated_at?: string
          venue_profile_id: string
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          description?: string | null
          event_title?: string | null
          id?: string
          is_visible?: boolean
          performance_date?: string | null
          updated_at?: string
          venue_profile_id?: string
        }
        Relationships: []
      }
      venue_gallery: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_position_y: number | null
          image_url: string
          venue_profile_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_position_y?: number | null
          image_url: string
          venue_profile_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_position_y?: number | null
          image_url?: string
          venue_profile_id?: string
        }
        Relationships: []
      }
      venue_partners: {
        Row: {
          allow_direct_contact: boolean
          created_at: string
          description: string | null
          id: string
          is_visible: boolean
          partner_profile_id: string
          partnership_type: string
          updated_at: string
          venue_profile_id: string
        }
        Insert: {
          allow_direct_contact?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          partner_profile_id: string
          partnership_type: string
          updated_at?: string
          venue_profile_id: string
        }
        Update: {
          allow_direct_contact?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          partner_profile_id?: string
          partnership_type?: string
          updated_at?: string
          venue_profile_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_profile: {
        Args: {
          _display_name?: string
          _profile_type?: Database["public"]["Enums"]["profile_type"]
          _user_id: string
        }
        Returns: string
      }
      get_artist_radio_stats: {
        Args: { artist_profile_id: string }
        Returns: {
          last_played_at: string
          ranking_position: number
          total_duration_seconds: number
          total_plays: number
        }[]
      }
      get_conversations_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversation_id: string
          conversation_title: string
          conversation_type: Database["public"]["Enums"]["conversation_type"]
          is_archived: boolean
          is_blocked: boolean
          is_pinned: boolean
          last_message_at: string
          last_message_content: string
          last_message_created_at: string
          peer_avatar_url: string
          peer_display_name: string
          peer_profile_type: Database["public"]["Enums"]["profile_type"]
          peer_user_id: string
          reply_received: boolean
          unread_count: number
        }[]
      }
      get_conversations_with_peers: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversation_id: string
          conversation_title: string
          conversation_type: Database["public"]["Enums"]["conversation_type"]
          is_blocked: boolean
          last_message_at: string
          last_message_content: string
          last_message_created_at: string
          peer_avatar_url: string
          peer_display_name: string
          peer_profile_type: Database["public"]["Enums"]["profile_type"]
          peer_user_id: string
          reply_received: boolean
        }[]
      }
      get_radio_playlist: {
        Args: Record<PropertyKey, never>
        Returns: {
          artist_avatar: string
          artist_name: string
          artist_profile_id: string
          file_name: string
          file_url: string
          media_asset_id: string
          priority_boost: number
          subscription_type: string
          track_id: string
          weight: number
        }[]
      }
      get_top_artists: {
        Args: { genre_filter?: string; limit_count?: number }
        Returns: {
          avatar_url: string
          avg_communication_score: number
          avg_professionalism_score: number
          avg_talent_score: number
          combined_score: number
          display_name: string
          genres: string[]
          location: string
          overall_score: number
          profile_id: string
          total_plays: number
          total_reviews: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      send_admin_broadcast: {
        Args: {
          content?: string
          only_public?: boolean
          profile_types?: Database["public"]["Enums"]["profile_type"][]
        }
        Returns: {
          error_count: number
          sent_count: number
        }[]
      }
      send_admin_message: {
        Args: { content: string; target_user_id: string }
        Returns: string
      }
      start_direct_conversation: {
        Args: { target_user_id: string }
        Returns: string
      }
    }
    Enums: {
      annonce_status: "draft" | "published" | "closed" | "cancelled"
      app_role: "admin" | "artist" | "agent" | "manager" | "lieu"
      application_status: "pending" | "accepted" | "rejected"
      availability_status: "available" | "busy" | "unavailable"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      conversation_type: "direct" | "group"
      event_status: "draft" | "published" | "cancelled" | "completed"
      media_type: "image" | "video" | "audio"
      profile_type: "artist" | "agent" | "manager" | "lieu"
      representation_status: "pending" | "accepted" | "rejected" | "revoked"
      roadmap_item_status:
        | "done"
        | "in_progress"
        | "planned"
        | "on_hold"
        | "cancelled"
      roadmap_item_type: "feature" | "task" | "selling_point"
      roadmap_priority: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      annonce_status: ["draft", "published", "closed", "cancelled"],
      app_role: ["admin", "artist", "agent", "manager", "lieu"],
      application_status: ["pending", "accepted", "rejected"],
      availability_status: ["available", "busy", "unavailable"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      conversation_type: ["direct", "group"],
      event_status: ["draft", "published", "cancelled", "completed"],
      media_type: ["image", "video", "audio"],
      profile_type: ["artist", "agent", "manager", "lieu"],
      representation_status: ["pending", "accepted", "rejected", "revoked"],
      roadmap_item_status: [
        "done",
        "in_progress",
        "planned",
        "on_hold",
        "cancelled",
      ],
      roadmap_item_type: ["feature", "task", "selling_point"],
      roadmap_priority: ["low", "medium", "high", "critical"],
    },
  },
} as const
