export type AppRole = 'admin' | 'artist' | 'agent' | 'lieu' | 'manager' | 'influenceur' | 'academie' | 'sponsors' | 'media' | 'agence';
export type ProfileType = 'artist' | 'agent' | 'lieu' | 'manager' | 'influenceur' | 'academie' | 'sponsors' | 'media' | 'agence';
export type EventStatus = 'draft' | 'published' | 'cancelled';
export type BookingStatus = 'draft' | 'proposed' | 'confirmed' | 'cancelled' | 'completed';
export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative';
export type AnnonceStatus = 'draft' | 'published' | 'closed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type MediaType = 'image' | 'video' | 'audio' | 'doc';
export type ConversationType = 'direct' | 'group';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  profile_type: ProfileType;
  secondary_profile_type?: ProfileType;
  bio?: string;
  avatar_url?: string;
  location?: string;
  genres?: string[];
  experience?: string;
  website?: string;
  instagram_url?: string;
  tiktok_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  email?: string;
  phone?: string;
  slug?: string;
  is_public: boolean;
  accepts_direct_contact?: boolean;
  preferred_contact_profile_id?: string;
  onboarding_completed?: boolean;
  // Optional featured artist fields for future use
  is_featured?: boolean;
  featured_rank?: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Annonce {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location?: string;
  event_date?: string;
  deadline?: string;
  status: AnnonceStatus;
  budget_min?: number;
  budget_max?: number;
  requirements?: string;
  genres?: string[];
  image_url?: string;
  image_position_y?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  applicant_id: string;
  annonce_id: string;
  status: ApplicationStatus;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_profile_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  author?: Profile;
}

export interface AgentArtist {
  id: string;
  agent_profile_id: string;
  artist_profile_id: string;
  created_at: string;
}

export interface ManagerArtist {
  id: string;
  manager_profile_id: string;
  artist_profile_id: string;
  created_at: string;
}

export interface Event {
  id: string;
  host_lieu_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at?: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  host_lieu?: Profile;
  creator?: Profile;
}

export interface Booking {
  id: string;
  event_id: string;
  artist_id: string;
  facilitated_by?: string;
  status: BookingStatus;
  fee_cents?: number;
  currency: string;
  start_at?: string;
  end_at?: string;
  created_by: string;
  created_at: string;
  event?: Event;
  artist?: Profile;
  facilitator?: Profile;
}

export interface MediaAsset {
  id: string;
  profile_id: string;
  media_type: MediaType;
  file_url: string;
  file_name: string;
  description?: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  artist_profile_id: string;
  start_date: string;
  end_date: string;
  status: AvailabilityStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InfluencerLink {
  id: string;
  influencer_profile_id: string;
  code: string;
  name?: string;
  description?: string;
  is_active: boolean;
  clicks_count: number;
  conversions_count: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateVisit {
  id: string;
  link_id: string;
  session_id: string;
  visitor_ip?: string;
  user_agent?: string;
  referrer?: string;
  page_url?: string;
  country?: string;
  city?: string;
  visited_at: string;
}

export interface AffiliateConversion {
  id: string;
  link_id: string;
  visit_id?: string;
  user_id?: string;
  conversion_type: 'registration' | 'subscription' | 'booking';
  conversion_value?: number;
  commission_rate?: number;
  commission_amount?: number;
  conversion_status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  converted_at: string;
  confirmed_at?: string;
  paid_at?: string;
}