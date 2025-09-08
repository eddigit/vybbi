export type AppRole = 'admin' | 'artist' | 'agent' | 'lieu' | 'manager';
export type ProfileType = 'artist' | 'agent' | 'lieu' | 'manager';
export type EventStatus = 'draft' | 'published' | 'cancelled';
export type BookingStatus = 'draft' | 'proposed' | 'confirmed' | 'cancelled' | 'completed';
export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative';
export type AnnonceStatus = 'draft' | 'open' | 'closed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type MediaType = 'image' | 'video' | 'audio' | 'doc';
export type ConversationType = 'direct' | 'group';

export interface Profile {
  id: string;
  display_name: string;
  profile_type: ProfileType;
  bio?: string;
  avatar_url?: string;
  location?: string;
  genres?: string[];
  years_experience?: number;
  website_url?: string;
  is_public: boolean;
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
  posted_by: string;
  title: string;
  description?: string;
  location?: string;
  event_date?: string;
  status: AnnonceStatus;
  budget_min_cents?: number;
  budget_max_cents?: number;
  created_at: string;
  updated_at: string;
  poster?: Profile;
}

export interface Application {
  id: string;
  annonce_id: string;
  applicant_id: string;
  message?: string;
  status: ApplicationStatus;
  created_at: string;
  applicant?: Profile;
  annonce?: Annonce;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  created_by: string;
  created_at: string;
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
  author_id: string;
  subject_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  author?: Profile;
}

export interface AgentArtist {
  id: string;
  agent_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  agent?: Profile;
  artist?: Profile;
}

export interface ManagerArtist {
  id: string;
  manager_id: string;
  artist_id: string;
  status: string;
  created_at: string;
  manager?: Profile;
  artist?: Profile;
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
  type: MediaType;
  url: string;
  title?: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  artist_id: string;
  start_at: string;
  end_at: string;
  status: AvailabilityStatus;
  is_public: boolean;
  note?: string;
  created_at: string;
}