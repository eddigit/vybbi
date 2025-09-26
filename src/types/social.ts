export interface SocialPost {
  id: string;
  user_id: string;
  profile_id: string;
  content: string;
  post_type: string;
  visibility: string;
  related_id?: string;
  created_at: string;
  updated_at: string;
  author_display_name: string;
  author_avatar_url?: string;
  author_profile_type: string;
  author_profile_id: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  media_attachments?: PostMedia[];
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'audio';
  thumbnail_url?: string;
  file_size?: number;
  duration?: number;
  alt_text?: string;
  created_at: string;
}

export interface PostInteraction {
  id: string;
  post_id: string;
  user_id: string;
  profile_id: string;
  interaction_type: 'like' | 'comment' | 'share';
  comment_text?: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_user_id: string;
  follower_profile_id: string;
  followed_user_id: string;
  followed_profile_id: string;
  created_at: string;
}

export interface UserPresence {
  user_id: string;
  profile_id: string;
  display_name: string;
  avatar_url?: string;
  profile_type: string;
  status_message?: string;
  last_seen_at: string;
  is_online?: boolean;
}

export interface CreatePostData {
  content: string;
  post_type: string;
  visibility: string;
  related_id?: string;
  media_files?: File[];
}

export interface ServiceRequest {
  id: string;
  request_type: 'offer' | 'demand';
  service_category: 'performance' | 'venue' | 'agent' | 'other';
  profile_types?: string[];
  location: string;
  budget_min?: number;
  budget_max?: number;
  event_date?: string;
  deadline?: string;
  description: string;
  requirements?: string;
  created_by: string;
  status: 'active' | 'closed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface ServiceApplication {
  id: string;
  service_request_id: string;
  applicant_user_id: string;
  applicant_profile_id: string;
  message?: string;
  proposed_fee?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequestData {
  request_type: 'offer' | 'demand';
  service_category: 'performance' | 'venue' | 'agent' | 'other';
  profile_types?: string[];
  location: string;
  budget_min?: number;
  budget_max?: number;
  event_date?: string;
  deadline?: string;
  description: string;
  requirements?: string;
}