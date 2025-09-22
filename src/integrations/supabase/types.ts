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
      admin_mock_profiles: {
        Row: {
          ai_generated_data: Json | null
          created_at: string
          id: string
          is_mock: boolean | null
          profile_id: string
          profile_type: string
          updated_at: string
        }
        Insert: {
          ai_generated_data?: Json | null
          created_at?: string
          id?: string
          is_mock?: boolean | null
          profile_id: string
          profile_type: string
          updated_at?: string
        }
        Update: {
          ai_generated_data?: Json | null
          created_at?: string
          id?: string
          is_mock?: boolean | null
          profile_id?: string
          profile_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_mock_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_mock_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_mock_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_secrets: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          last_accessed_at: string | null
          last_accessed_by: string | null
          name: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          name: string
          updated_at?: string
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_accessed_at?: string | null
          last_accessed_by?: string | null
          name?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_conversions: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          confirmed_at: string | null
          conversion_status: string
          conversion_type: string
          conversion_value: number | null
          converted_at: string
          id: string
          is_exclusive_program: boolean | null
          is_recurring: boolean | null
          link_id: string
          monthly_commission_amount: number | null
          paid_at: string | null
          recurring_end_date: string | null
          recurring_start_date: string | null
          user_id: string | null
          visit_id: string | null
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          conversion_status?: string
          conversion_type: string
          conversion_value?: number | null
          converted_at?: string
          id?: string
          is_exclusive_program?: boolean | null
          is_recurring?: boolean | null
          link_id: string
          monthly_commission_amount?: number | null
          paid_at?: string | null
          recurring_end_date?: string | null
          recurring_start_date?: string | null
          user_id?: string | null
          visit_id?: string | null
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          confirmed_at?: string | null
          conversion_status?: string
          conversion_type?: string
          conversion_value?: number | null
          converted_at?: string
          id?: string
          is_exclusive_program?: boolean | null
          is_recurring?: boolean | null
          link_id?: string
          monthly_commission_amount?: number | null
          paid_at?: string | null
          recurring_end_date?: string | null
          recurring_start_date?: string | null
          user_id?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "influencer_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "affiliate_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_visits: {
        Row: {
          city: string | null
          country: string | null
          id: string
          link_id: string
          page_url: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          visited_at: string
          visitor_ip: unknown | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          link_id: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visited_at?: string
          visitor_ip?: unknown | null
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          link_id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visited_at?: string
          visitor_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_visits_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "influencer_links"
            referencedColumns: ["id"]
          },
        ]
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
      agent_commissions: {
        Row: {
          agent_id: string
          amount: number
          conversion_id: string
          created_at: string
          id: string
          paid_at: string | null
          payment_reference: string | null
          status: string
        }
        Insert: {
          agent_id: string
          amount: number
          conversion_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          conversion_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_commissions_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "conversion_tracking"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "artist_radio_subscriptions_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_radio_subscriptions_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          completed_at: string | null
          current_step_id: string | null
          id: string
          metadata: Json | null
          prospect_id: string
          started_at: string | null
          status: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step_id?: string | null
          id?: string
          metadata?: Json | null
          prospect_id: string
          started_at?: string | null
          status?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          current_step_id?: string | null
          id?: string
          metadata?: Json | null
          prospect_id?: string
          started_at?: string | null
          status?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "automation_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_steps: {
        Row: {
          channel: string
          conditions: Json | null
          content: string | null
          created_at: string | null
          delay_hours: number | null
          id: string
          order_number: number
          template_id: string | null
          workflow_id: string
        }
        Insert: {
          channel: string
          conditions?: Json | null
          content?: string | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          order_number: number
          template_id?: string | null
          workflow_id: string
        }
        Update: {
          channel?: string
          conditions?: Json | null
          content?: string | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          order_number?: number
          template_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
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
      blockchain_certifications: {
        Row: {
          block_number: number | null
          blockchain_network: string
          certificate_url: string | null
          certification_data: Json
          certification_hash: string
          certified_by: string | null
          created_at: string
          id: string
          music_release_id: string
          qr_code_url: string | null
          solana_signature: string | null
          status: string
          transaction_hash: string
          updated_at: string
        }
        Insert: {
          block_number?: number | null
          blockchain_network?: string
          certificate_url?: string | null
          certification_data?: Json
          certification_hash: string
          certified_by?: string | null
          created_at?: string
          id?: string
          music_release_id: string
          qr_code_url?: string | null
          solana_signature?: string | null
          status?: string
          transaction_hash: string
          updated_at?: string
        }
        Update: {
          block_number?: number | null
          blockchain_network?: string
          certificate_url?: string | null
          certification_data?: Json
          certification_hash?: string
          certified_by?: string | null
          created_at?: string
          id?: string
          music_release_id?: string
          qr_code_url?: string | null
          solana_signature?: string | null
          status?: string
          transaction_hash?: string
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
      communities: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          member_count: number
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          community_id: string
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          name: string
          position: number
          type: string
        }
        Insert: {
          community_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          position?: number
          type?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          position?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_channels_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          is_muted: boolean
          joined_at: string
          profile_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          is_muted?: boolean
          joined_at?: string
          profile_id?: string | null
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          is_muted?: boolean
          joined_at?: string
          profile_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          is_pinned: boolean
          message_type: string
          reply_to_message_id: string | null
          sender_id: string
          sender_profile_id: string | null
          updated_at: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          message_type?: string
          reply_to_message_id?: string | null
          sender_id: string
          sender_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_pinned?: boolean
          message_type?: string
          reply_to_message_id?: string | null
          sender_id?: string
          sender_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      conversion_tracking: {
        Row: {
          agent_id: string
          commission_amount: number | null
          commission_paid: boolean | null
          commission_paid_at: string | null
          confirmed_at: string | null
          conversion_status: Database["public"]["Enums"]["conversion_status"]
          conversion_value: number | null
          created_at: string
          id: string
          prospect_id: string
          subscription_type: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          confirmed_at?: string | null
          conversion_status?: Database["public"]["Enums"]["conversion_status"]
          conversion_value?: number | null
          created_at?: string
          id?: string
          prospect_id: string
          subscription_type?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          confirmed_at?: string | null
          conversion_status?: Database["public"]["Enums"]["conversion_status"]
          conversion_value?: number | null
          created_at?: string
          id?: string
          prospect_id?: string
          subscription_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_tracking_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_tracking_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
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
      email_templates: {
        Row: {
          brevo_template_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean
          language: string | null
          name: string
          provider: string | null
          required_variables: Json | null
          subject: string
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          brevo_template_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          language?: string | null
          name: string
          provider?: string | null
          required_variables?: Json | null
          subject: string
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          brevo_template_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          language?: string | null
          name?: string
          provider?: string | null
          required_variables?: Json | null
          subject?: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          profile_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          artist_profile_id: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          created_by_artist: boolean | null
          created_by_user_id: string | null
          description: string | null
          event_date: string
          event_time: string | null
          flyer_position_y: number | null
          flyer_url: string | null
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
          artist_profile_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by_artist?: boolean | null
          created_by_user_id?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          flyer_position_y?: number | null
          flyer_url?: string | null
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
          artist_profile_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          created_by_artist?: boolean | null
          created_by_user_id?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          flyer_position_y?: number | null
          flyer_url?: string | null
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
        Relationships: [
          {
            foreignKeyName: "events_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_links: {
        Row: {
          clicks_count: number
          code: string
          conversions_count: number
          created_at: string
          description: string | null
          id: string
          influencer_profile_id: string
          is_active: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          clicks_count?: number
          code: string
          conversions_count?: number
          created_at?: string
          description?: string | null
          id?: string
          influencer_profile_id: string
          is_active?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          clicks_count?: number
          code?: string
          conversions_count?: number
          created_at?: string
          description?: string | null
          id?: string
          influencer_profile_id?: string
          is_active?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_links_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_links_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_links_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string | null
          blocked_until: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string | null
          blocked_until?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string | null
          blocked_until?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
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
          duration_seconds: number | null
          file_name: string
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          music_release_id: string | null
          preview_url: string | null
          profile_id: string
          track_position: number | null
          waveform_data: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_name: string
          file_url: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          music_release_id?: string | null
          preview_url?: string | null
          profile_id: string
          track_position?: number | null
          waveform_data?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_name?: string
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          music_release_id?: string | null
          preview_url?: string | null
          profile_id?: string
          track_position?: number | null
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_music_release_id_fkey"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
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
      music_collaborators: {
        Row: {
          collaborator_name: string
          collaborator_profile_id: string | null
          created_at: string
          id: string
          music_release_id: string
          role: string
          royalty_percentage: number | null
        }
        Insert: {
          collaborator_name: string
          collaborator_profile_id?: string | null
          created_at?: string
          id?: string
          music_release_id: string
          role: string
          royalty_percentage?: number | null
        }
        Update: {
          collaborator_name?: string
          collaborator_profile_id?: string | null
          created_at?: string
          id?: string
          music_release_id?: string
          role?: string
          royalty_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "music_collaborators_collaborator_profile_id_fkey"
            columns: ["collaborator_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_collaborators_collaborator_profile_id_fkey"
            columns: ["collaborator_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_collaborators_collaborator_profile_id_fkey"
            columns: ["collaborator_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_collaborators_music_release_id_fkey"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      music_plays: {
        Row: {
          duration_played: number | null
          id: string
          ip_address: unknown | null
          music_release_id: string
          played_at: string
          source: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          duration_played?: number | null
          id?: string
          ip_address?: unknown | null
          music_release_id: string
          played_at?: string
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          duration_played?: number | null
          id?: string
          ip_address?: unknown | null
          music_release_id?: string
          played_at?: string
          source?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_plays_music_release_id_fkey"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      music_releases: {
        Row: {
          album_name: string | null
          apple_music_url: string | null
          artist_name: string
          bpm: number | null
          copyright_owner: string | null
          cover_image_url: string | null
          created_at: string
          credits: Json | null
          direct_audio_url: string | null
          distribution_service: string | null
          duration_seconds: number | null
          explicit_content: boolean | null
          featured_artists: Json | null
          genre: string | null
          id: string
          is_original_composition: boolean | null
          isrc_code: string | null
          key_signature: string | null
          label: string | null
          likes_count: number | null
          lyrics: string | null
          plays_count: number | null
          profile_id: string
          release_date: string | null
          royalty_percentage: number | null
          soundcloud_url: string | null
          spotify_url: string | null
          status: string | null
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          album_name?: string | null
          apple_music_url?: string | null
          artist_name: string
          bpm?: number | null
          copyright_owner?: string | null
          cover_image_url?: string | null
          created_at?: string
          credits?: Json | null
          direct_audio_url?: string | null
          distribution_service?: string | null
          duration_seconds?: number | null
          explicit_content?: boolean | null
          featured_artists?: Json | null
          genre?: string | null
          id?: string
          is_original_composition?: boolean | null
          isrc_code?: string | null
          key_signature?: string | null
          label?: string | null
          likes_count?: number | null
          lyrics?: string | null
          plays_count?: number | null
          profile_id: string
          release_date?: string | null
          royalty_percentage?: number | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          album_name?: string | null
          apple_music_url?: string | null
          artist_name?: string
          bpm?: number | null
          copyright_owner?: string | null
          cover_image_url?: string | null
          created_at?: string
          credits?: Json | null
          direct_audio_url?: string | null
          distribution_service?: string | null
          duration_seconds?: number | null
          explicit_content?: boolean | null
          featured_artists?: Json | null
          genre?: string | null
          id?: string
          is_original_composition?: boolean | null
          isrc_code?: string | null
          key_signature?: string | null
          label?: string | null
          likes_count?: number | null
          lyrics?: string | null
          plays_count?: number | null
          profile_id?: string
          release_date?: string | null
          royalty_percentage?: number | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_releases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_releases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_releases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string | null
          data: Json | null
          email_sent: boolean | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          message: string
          priority: number | null
          read_at: string | null
          related_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: number | null
          read_at?: string | null
          related_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: number | null
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          profile_id: string
          user_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          alt_text: string | null
          created_at: string
          duration: number | null
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          post_id: string
          thumbnail_url: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          post_id: string
          thumbnail_url?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          post_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          referrer_page: string | null
          session_id: string
          view_type: Database["public"]["Enums"]["view_type"]
          viewed_profile_id: string
          viewer_profile_id: string | null
          viewer_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referrer_page?: string | null
          session_id?: string
          view_type?: Database["public"]["Enums"]["view_type"]
          viewed_profile_id: string
          viewer_profile_id?: string | null
          viewer_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referrer_page?: string | null
          session_id?: string
          view_type?: Database["public"]["Enums"]["view_type"]
          viewed_profile_id?: string
          viewer_profile_id?: string | null
          viewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
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
          onboarding_completed: boolean | null
          phone: string | null
          preferred_contact_profile_id: string | null
          profile_completion_percentage: number | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          secondary_profile_type:
            | Database["public"]["Enums"]["profile_type"]
            | null
          siret_number: string | null
          siret_verified: boolean | null
          siret_verified_at: string | null
          slug: string | null
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
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_contact_profile_id?: string | null
          profile_completion_percentage?: number | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          secondary_profile_type?:
            | Database["public"]["Enums"]["profile_type"]
            | null
          siret_number?: string | null
          siret_verified?: boolean | null
          siret_verified_at?: string | null
          slug?: string | null
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
          onboarding_completed?: boolean | null
          phone?: string | null
          preferred_contact_profile_id?: string | null
          profile_completion_percentage?: number | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          secondary_profile_type?:
            | Database["public"]["Enums"]["profile_type"]
            | null
          siret_number?: string | null
          siret_verified?: boolean | null
          siret_verified_at?: string | null
          slug?: string | null
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
          {
            foreignKeyName: "fk_preferred_contact_profile"
            columns: ["preferred_contact_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_preferred_contact_profile"
            columns: ["preferred_contact_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_assignments: {
        Row: {
          agent_id: string
          assigned_at: string
          assigned_by: string | null
          id: string
          prospect_id: string
          reason: string | null
          unassigned_at: string | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          prospect_id: string
          reason?: string | null
          unassigned_at?: string | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          prospect_id?: string
          reason?: string | null
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_assignments_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_engagement_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          occurred_at: string | null
          prospect_id: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          occurred_at?: string | null
          prospect_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          occurred_at?: string | null
          prospect_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_engagement_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          failed_imports: number | null
          file_name: string
          id: string
          import_status: string | null
          imported_by: string | null
          successful_imports: number | null
          total_records: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failed_imports?: number | null
          file_name: string
          id?: string
          import_status?: string | null
          imported_by?: string | null
          successful_imports?: number | null
          total_records?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          failed_imports?: number | null
          file_name?: string
          id?: string
          import_status?: string | null
          imported_by?: string | null
          successful_imports?: number | null
          total_records?: number | null
        }
        Relationships: []
      }
      prospect_interactions: {
        Row: {
          agent_id: string
          completed_at: string | null
          content: string | null
          created_at: string
          email_clicked: boolean | null
          email_opened: boolean | null
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          next_action: string | null
          outcome: string | null
          prospect_id: string
          scheduled_at: string | null
          subject: string | null
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          email_clicked?: boolean | null
          email_opened?: boolean | null
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          next_action?: string | null
          outcome?: string | null
          prospect_id: string
          scheduled_at?: string | null
          subject?: string | null
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          email_clicked?: boolean | null
          email_opened?: boolean | null
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          next_action?: string | null
          outcome?: string | null
          prospect_id?: string
          scheduled_at?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_interactions_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_meetings: {
        Row: {
          agenda: string | null
          created_at: string | null
          duration: number | null
          id: string
          location: string | null
          meeting_time: string
          meeting_type: string
          notes: string | null
          prospect_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_time: string
          meeting_type?: string
          notes?: string | null
          prospect_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          meeting_time?: string
          meeting_type?: string
          notes?: string | null
          prospect_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_meetings_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_scoring_history: {
        Row: {
          calculated_at: string | null
          calculated_by: string | null
          factors: Json | null
          id: string
          new_score: number | null
          previous_score: number | null
          prospect_id: string | null
          score_type: string | null
        }
        Insert: {
          calculated_at?: string | null
          calculated_by?: string | null
          factors?: Json | null
          id?: string
          new_score?: number | null
          previous_score?: number | null
          prospect_id?: string | null
          score_type?: string | null
        }
        Update: {
          calculated_at?: string | null
          calculated_by?: string | null
          factors?: Json | null
          id?: string
          new_score?: number | null
          previous_score?: number | null
          prospect_id?: string | null
          score_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_scoring_history_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      prospect_tasks: {
        Row: {
          agent_id: string | null
          auto_created: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          execution_attempt: number | null
          id: string
          last_error_message: string | null
          locked_at: string | null
          processing_by: string | null
          processing_status: string | null
          prospect_id: string | null
          scheduled_at: string
          status: string | null
          task_type: string
          template_data: Json | null
          title: string
          workflow_id: string | null
        }
        Insert: {
          agent_id?: string | null
          auto_created?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          execution_attempt?: number | null
          id?: string
          last_error_message?: string | null
          locked_at?: string | null
          processing_by?: string | null
          processing_status?: string | null
          prospect_id?: string | null
          scheduled_at: string
          status?: string | null
          task_type: string
          template_data?: Json | null
          title: string
          workflow_id?: string | null
        }
        Update: {
          agent_id?: string | null
          auto_created?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          execution_attempt?: number | null
          id?: string
          last_error_message?: string | null
          locked_at?: string | null
          processing_by?: string | null
          processing_status?: string | null
          prospect_id?: string | null
          scheduled_at?: string
          status?: string | null
          task_type?: string
          template_data?: Json | null
          title?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_tasks_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "prospecting_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      prospecting_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          email_template_body: string | null
          email_template_subject: string | null
          id: string
          is_active: boolean | null
          name: string
          target_type: Database["public"]["Enums"]["prospect_type"] | null
          total_clicked: number | null
          total_converted: number | null
          total_opened: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_template_body?: string | null
          email_template_subject?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          target_type?: Database["public"]["Enums"]["prospect_type"] | null
          total_clicked?: number | null
          total_converted?: number | null
          total_opened?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_template_body?: string | null
          email_template_subject?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_type?: Database["public"]["Enums"]["prospect_type"] | null
          total_clicked?: number | null
          total_converted?: number | null
          total_opened?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospecting_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      prospecting_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          prospect_type: string
          steps: Json
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prospect_type: string
          steps?: Json
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prospect_type?: string
          steps?: Json
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          address: string | null
          assigned_agent_id: string | null
          assigned_at: string | null
          auto_scoring_enabled: boolean | null
          city: string | null
          collaboration_potential: string | null
          company_name: string | null
          company_size: string | null
          contact_name: string
          converted_at: string | null
          converted_user_id: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          engagement_history: Json | null
          estimated_budget: number | null
          facebook_url: string | null
          id: string
          industry_sector: string | null
          influence_score: number | null
          instagram_url: string | null
          last_contact_at: string | null
          last_engagement_score: number | null
          linkedin_url: string | null
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          priority_level: string | null
          prospect_type: Database["public"]["Enums"]["prospect_type"]
          qualification_score: number | null
          referral_prospect_id: string | null
          referral_source: string | null
          region: string | null
          social_media: Json | null
          source: string | null
          status: Database["public"]["Enums"]["prospect_status"]
          tags: string[] | null
          tiktok_url: string | null
          timezone: string | null
          twitter_url: string | null
          updated_at: string
          website: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          assigned_agent_id?: string | null
          assigned_at?: string | null
          auto_scoring_enabled?: boolean | null
          city?: string | null
          collaboration_potential?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name: string
          converted_at?: string | null
          converted_user_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          engagement_history?: Json | null
          estimated_budget?: number | null
          facebook_url?: string | null
          id?: string
          industry_sector?: string | null
          influence_score?: number | null
          instagram_url?: string | null
          last_contact_at?: string | null
          last_engagement_score?: number | null
          linkedin_url?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          priority_level?: string | null
          prospect_type: Database["public"]["Enums"]["prospect_type"]
          qualification_score?: number | null
          referral_prospect_id?: string | null
          referral_source?: string | null
          region?: string | null
          social_media?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          tags?: string[] | null
          tiktok_url?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          assigned_agent_id?: string | null
          assigned_at?: string | null
          auto_scoring_enabled?: boolean | null
          city?: string | null
          collaboration_potential?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_name?: string
          converted_at?: string | null
          converted_user_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          engagement_history?: Json | null
          estimated_budget?: number | null
          facebook_url?: string | null
          id?: string
          industry_sector?: string | null
          influence_score?: number | null
          instagram_url?: string | null
          last_contact_at?: string | null
          last_engagement_score?: number | null
          linkedin_url?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          priority_level?: string | null
          prospect_type?: Database["public"]["Enums"]["prospect_type"]
          qualification_score?: number | null
          referral_prospect_id?: string | null
          referral_source?: string | null
          region?: string | null
          social_media?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          tags?: string[] | null
          tiktok_url?: string | null
          timezone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "vybbi_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_referral_prospect_id_fkey"
            columns: ["referral_prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
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
          media_asset_id: string | null
          music_release_id: string | null
          played_at: string
          playlist_id: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          media_asset_id?: string | null
          music_release_id?: string | null
          played_at?: string
          playlist_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          media_asset_id?: string | null
          music_release_id?: string | null
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
            foreignKeyName: "radio_play_history_music_release_id_fkey"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
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
          media_asset_id: string | null
          music_release_id: string | null
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
          media_asset_id?: string | null
          music_release_id?: string | null
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
          media_asset_id?: string | null
          music_release_id?: string | null
          play_count?: number
          playlist_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_radio_playlist_tracks_music_release"
            columns: ["music_release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
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
      recurring_commissions: {
        Row: {
          amount: number
          conversion_id: string | null
          created_at: string
          id: string
          influencer_profile_id: string
          is_exclusive_program: boolean | null
          month_year: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          conversion_id?: string | null
          created_at?: string
          id?: string
          influencer_profile_id: string
          is_exclusive_program?: boolean | null
          month_year: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          conversion_id?: string | null
          created_at?: string
          id?: string
          influencer_profile_id?: string
          is_exclusive_program?: boolean | null
          month_year?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_commissions_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "affiliate_conversions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_commissions_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_commissions_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_commissions_influencer_profile_id_fkey"
            columns: ["influencer_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "reviews_reviewed_profile_id_fkey"
            columns: ["reviewed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_profile_id_fkey"
            columns: ["reviewed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
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
      scoring_rules: {
        Row: {
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rule_type: string
          score_impact: number
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule_type: string
          score_impact: number
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string
          score_impact?: number
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_ticker_messages: {
        Row: {
          created_at: string
          created_by: string | null
          days_of_week: string[] | null
          display_order: number | null
          end_date: string | null
          end_time: string | null
          id: string
          is_active: boolean
          message: string
          priority: number | null
          start_date: string | null
          start_time: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          days_of_week?: string[] | null
          display_order?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: number | null
          start_date?: string | null
          start_time?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          days_of_week?: string[] | null
          display_order?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: number | null
          start_date?: string | null
          start_time?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_type: string
          profile_id: string
          related_id: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_type?: string
          profile_id: string
          related_id?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_type?: string
          profile_id?: string
          related_id?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          followed_profile_id: string
          followed_user_id: string
          follower_profile_id: string
          follower_user_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_profile_id: string
          followed_user_id: string
          follower_profile_id: string
          follower_user_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_profile_id?: string
          followed_user_id?: string
          follower_profile_id?: string
          follower_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_followed_profile_id_fkey"
            columns: ["followed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_followed_profile_id_fkey"
            columns: ["followed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_followed_profile_id_fkey"
            columns: ["followed_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_profile_id_fkey"
            columns: ["follower_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_profile_id_fkey"
            columns: ["follower_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_profile_id_fkey"
            columns: ["follower_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          is_online: boolean
          last_seen_at: string
          profile_id: string
          status_message: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen_at?: string
          profile_id: string
          status_message?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen_at?: string
          profile_id?: string
          status_message?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_presence_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      vybbi_agents: {
        Row: {
          agent_name: string
          commission_rate: number
          created_at: string
          email: string
          hire_date: string
          id: string
          is_active: boolean
          phone: string | null
          total_commissions: number | null
          total_converted: number | null
          total_prospects_assigned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          commission_rate?: number
          created_at?: string
          email: string
          hire_date?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          total_commissions?: number | null
          total_converted?: number | null
          total_prospects_assigned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          commission_rate?: number
          created_at?: string
          email?: string
          hire_date?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          total_commissions?: number | null
          total_converted?: number | null
          total_prospects_assigned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vybbi_interactions: {
        Row: {
          action: string | null
          created_at: string
          filters: Json | null
          id: string
          message: string
          response: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          message: string
          response: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          message?: string
          response?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean | null
          webhook_id: string
        }
        Insert: {
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id: string
        }
        Update: {
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          created_at: string | null
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          accepts_direct_contact: boolean | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          experience: string | null
          genres: string[] | null
          header_position_y: number | null
          header_url: string | null
          id: string | null
          instagram_url: string | null
          is_public: boolean | null
          languages: string[] | null
          location: string | null
          onboarding_completed: boolean | null
          preferred_contact_profile_id: string | null
          profile_completion_percentage: number | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          slug: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          talents: string[] | null
          tiktok_url: string | null
          updated_at: string | null
          user_id: string | null
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
          created_at?: string | null
          display_name?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string | null
          instagram_url?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          preferred_contact_profile_id?: string | null
          profile_completion_percentage?: number | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          slug?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          created_at?: string | null
          display_name?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string | null
          instagram_url?: string | null
          is_public?: boolean | null
          languages?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          preferred_contact_profile_id?: string | null
          profile_completion_percentage?: number | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          slug?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          {
            foreignKeyName: "fk_preferred_contact_profile"
            columns: ["preferred_contact_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_preferred_contact_profile"
            columns: ["preferred_contact_profile_id"]
            isOneToOne: false
            referencedRelation: "safe_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_public_profiles: {
        Row: {
          accepts_direct_contact: boolean | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          experience: string | null
          genres: string[] | null
          header_position_y: number | null
          header_url: string | null
          id: string | null
          instagram_url: string | null
          languages: string[] | null
          location: string | null
          onboarding_completed: boolean | null
          profile_completion_percentage: number | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          slug: string | null
          soundcloud_url: string | null
          spotify_url: string | null
          talents: string[] | null
          tiktok_url: string | null
          updated_at: string | null
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
          created_at?: string | null
          display_name?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string | null
          instagram_url?: string | null
          languages?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          slug?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
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
          created_at?: string | null
          display_name?: string | null
          experience?: string | null
          genres?: string[] | null
          header_position_y?: number | null
          header_url?: string | null
          id?: string | null
          instagram_url?: string | null
          languages?: string[] | null
          location?: string | null
          onboarding_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          slug?: string | null
          soundcloud_url?: string | null
          spotify_url?: string | null
          talents?: string[] | null
          tiktok_url?: string | null
          updated_at?: string | null
          venue_capacity?: number | null
          venue_category?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      security_summary: {
        Row: {
          access_count: number | null
          access_date: string | null
          action: string | null
          table_name: string | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_prospect_to_agent: {
        Args: { prospect_id: string }
        Returns: string
      }
      audit_profile_access: {
        Args: { access_type: string; profile_id: string }
        Returns: undefined
      }
      audit_rls_access: {
        Args: { operation: string; table_name: string }
        Returns: undefined
      }
      audit_sensitive_access: {
        Args: { action: string; record_id?: string; table_name: string }
        Returns: undefined
      }
      calculate_monthly_recurring_commissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_profile_completion: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: number
      }
      check_security_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_task_locks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_login_attempts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_task_processing: {
        Args: { error_message?: string; new_status: string; task_id: string }
        Returns: boolean
      }
      create_notification_with_email: {
        Args: {
          p_data?: Json
          p_message: string
          p_related_id?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      ensure_user_profile: {
        Args: {
          _display_name?: string
          _profile_type?: Database["public"]["Enums"]["profile_type"]
          _user_id: string
        }
        Returns: string
      }
      generate_affiliate_code: {
        Args: { base_name?: string }
        Returns: string
      }
      generate_security_report: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_admin_emails: {
        Args: Record<PropertyKey, never>
        Returns: string[]
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
      get_event_attendees_count: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_online_users: {
        Args: { limit_param?: number }
        Returns: {
          avatar_url: string
          display_name: string
          last_seen_at: string
          profile_id: string
          profile_type: Database["public"]["Enums"]["profile_type"]
          status_message: string
          user_id: string
        }[]
      }
      get_profile_stats: {
        Args: { profile_id: string }
        Returns: Json
      }
      get_profile_view_stats: {
        Args: { p_profile_id: string }
        Returns: {
          agent_views: number
          manager_views: number
          total_views: number
          unique_visitors: number
          venue_views: number
          views_this_month: number
          views_this_week: number
        }[]
      }
      get_radio_playlist: {
        Args: Record<PropertyKey, never>
        Returns: {
          artist_avatar: string
          artist_name: string
          artist_profile_id: string
          cover_image_url: string
          direct_audio_url: string
          file_url: string
          music_release_id: string
          priority_boost: number
          soundcloud_url: string
          spotify_url: string
          subscription_type: string
          title: string
          track_id: string
          weight: number
          youtube_url: string
        }[]
      }
      get_safe_profile_data: {
        Args: { profile_identifier: string }
        Returns: {
          accepts_direct_contact: boolean
          avatar_url: string
          bio: string
          city: string
          created_at: string
          display_name: string
          experience: string
          genres: string[]
          header_position_y: number
          header_url: string
          id: string
          instagram_url: string
          is_public: boolean
          languages: string[]
          location: string
          onboarding_completed: boolean
          preferred_contact_profile_id: string
          profile_completion_percentage: number
          profile_type: Database["public"]["Enums"]["profile_type"]
          slug: string
          soundcloud_url: string
          spotify_url: string
          talents: string[]
          tiktok_url: string
          updated_at: string
          user_id: string
          venue_capacity: number
          venue_category: string
          website: string
          youtube_url: string
        }[]
      }
      get_security_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_social_feed: {
        Args: {
          feed_type?: string
          limit_param?: number
          offset_param?: number
          user_id_param: string
        }
        Returns: {
          author_avatar_url: string
          author_display_name: string
          author_profile_type: string
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          media_attachments: Json
          post_type: string
          profile_id: string
          related_id: string
          user_has_liked: boolean
          user_id: string
          visibility: string
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
      get_user_event_status: {
        Args: { event_uuid: string; user_uuid: string }
        Returns: string
      }
      get_user_follow_stats: {
        Args: { user_id_param: string }
        Returns: {
          followers_count: number
          following_count: number
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          display_name: string
          id: string
          is_public: boolean
          profile_type: Database["public"]["Enums"]["profile_type"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_community_member: {
        Args: { community_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { p_email: string }
        Returns: boolean
      }
      lock_and_process_tasks: {
        Args: { max_tasks?: number }
        Returns: {
          description: string
          prospect_data: Json
          prospect_id: string
          scheduled_at: string
          task_id: string
          task_type: string
          template_data: Json
          title: string
        }[]
      }
      log_security_event: {
        Args: {
          p_email?: string
          p_event_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_sensitive_access: {
        Args: { p_action: string; p_record_id?: string; p_table_name: string }
        Returns: undefined
      }
      resolve_profile: {
        Args: { identifier: string }
        Returns: {
          accepts_direct_contact: boolean
          avatar_url: string
          bio: string
          city: string
          created_at: string
          display_name: string
          email: string
          experience: string
          genres: string[]
          header_position_y: number
          header_url: string
          id: string
          instagram_url: string
          is_public: boolean
          is_slug_match: boolean
          languages: string[]
          location: string
          phone: string
          preferred_contact_profile_id: string
          profile_type: Database["public"]["Enums"]["profile_type"]
          slug: string
          soundcloud_url: string
          spotify_url: string
          talents: string[]
          tiktok_url: string
          updated_at: string
          user_id: string
          venue_capacity: number
          venue_category: string
          website: string
          youtube_url: string
        }[]
      }
      resolve_profile_by_slug: {
        Args: { profile_slug: string }
        Returns: {
          avatar_url: string
          bio: string
          city: string
          display_name: string
          id: string
          is_public: boolean
          profile_type: Database["public"]["Enums"]["profile_type"]
          slug: string
        }[]
      }
      security_phase1_status: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      send_notification_email: {
        Args: {
          p_data: Json
          p_message: string
          p_notification_id: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_email: string
        }
        Returns: undefined
      }
      start_direct_conversation: {
        Args: { target_user_id: string }
        Returns: string
      }
      test_rls_security: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      track_affiliate_conversion: {
        Args: {
          p_conversion_type: string
          p_conversion_value?: number
          p_user_id: string
        }
        Returns: string
      }
      track_affiliate_visit: {
        Args: {
          p_affiliate_code: string
          p_page_url?: string
          p_referrer?: string
          p_session_id: string
          p_user_agent?: string
        }
        Returns: Json
      }
      track_login_attempt: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address?: unknown
          p_success?: boolean
          p_user_agent?: string
        }
        Returns: Json
      }
      track_music_play: {
        Args: {
          p_duration_played?: number
          p_music_release_id: string
          p_source?: string
        }
        Returns: string
      }
      track_profile_view: {
        Args: {
          p_referrer_page?: string
          p_session_id?: string
          p_view_type?: Database["public"]["Enums"]["view_type"]
          p_viewed_profile_id: string
        }
        Returns: string
      }
      trigger_trial_offer_update: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      user_can_access_conversation: {
        Args: { conv_id: string }
        Returns: boolean
      }
      user_owns_profile: {
        Args: { profile_id_param: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
    }
    Enums: {
      annonce_status: "draft" | "published" | "closed" | "cancelled"
      app_role:
        | "admin"
        | "artist"
        | "agent"
        | "manager"
        | "lieu"
        | "influenceur"
        | "academie"
        | "sponsors"
        | "media"
        | "agence"
      application_status: "pending" | "accepted" | "rejected"
      availability_status: "available" | "busy" | "unavailable"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      conversation_type: "direct" | "group"
      conversion_status: "pending" | "confirmed" | "failed"
      event_status: "draft" | "published" | "cancelled" | "completed"
      interaction_type: "email" | "call" | "meeting" | "message" | "note"
      media_type: "image" | "video" | "audio"
      notification_type:
        | "new_message"
        | "agent_request"
        | "manager_request"
        | "booking_request"
        | "booking_confirmed"
        | "booking_cancelled"
        | "review_received"
        | "profile_view"
        | "application_received"
        | "application_accepted"
        | "application_rejected"
      profile_type:
        | "artist"
        | "agent"
        | "manager"
        | "lieu"
        | "influenceur"
        | "academie"
        | "sponsors"
        | "media"
        | "agence"
      prospect_status:
        | "new"
        | "contacted"
        | "qualified"
        | "interested"
        | "converted"
        | "rejected"
        | "unresponsive"
        | "meeting_scheduled"
      prospect_type: "artist" | "venue" | "agent" | "manager"
      representation_status: "pending" | "accepted" | "rejected" | "revoked"
      roadmap_item_status:
        | "done"
        | "in_progress"
        | "planned"
        | "on_hold"
        | "cancelled"
      roadmap_item_type: "feature" | "task" | "selling_point"
      roadmap_priority: "low" | "medium" | "high" | "critical"
      view_type: "full_profile" | "quick_preview" | "search_result"
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
      app_role: [
        "admin",
        "artist",
        "agent",
        "manager",
        "lieu",
        "influenceur",
        "academie",
        "sponsors",
        "media",
        "agence",
      ],
      application_status: ["pending", "accepted", "rejected"],
      availability_status: ["available", "busy", "unavailable"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      conversation_type: ["direct", "group"],
      conversion_status: ["pending", "confirmed", "failed"],
      event_status: ["draft", "published", "cancelled", "completed"],
      interaction_type: ["email", "call", "meeting", "message", "note"],
      media_type: ["image", "video", "audio"],
      notification_type: [
        "new_message",
        "agent_request",
        "manager_request",
        "booking_request",
        "booking_confirmed",
        "booking_cancelled",
        "review_received",
        "profile_view",
        "application_received",
        "application_accepted",
        "application_rejected",
      ],
      profile_type: [
        "artist",
        "agent",
        "manager",
        "lieu",
        "influenceur",
        "academie",
        "sponsors",
        "media",
        "agence",
      ],
      prospect_status: [
        "new",
        "contacted",
        "qualified",
        "interested",
        "converted",
        "rejected",
        "unresponsive",
        "meeting_scheduled",
      ],
      prospect_type: ["artist", "venue", "agent", "manager"],
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
      view_type: ["full_profile", "quick_preview", "search_result"],
    },
  },
} as const
