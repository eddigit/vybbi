export type AppRole = 'admin' | 'artist' | 'agent' | 'venue';
export type ProfileType = 'artist' | 'agent' | 'venue';
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