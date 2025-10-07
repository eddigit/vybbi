-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'invite_only')),
  category TEXT, -- e.g., 'genre', 'radio', 'events', 'influencers'
  avatar_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_muted BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(community_id, user_id)
);

-- Create community channels table (for different topics within a community)
CREATE TABLE public.community_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice', 'live_radio')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community messages table
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_profile_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  reply_to_message_id UUID REFERENCES public.community_messages(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Public communities are viewable by everyone" 
ON public.communities FOR SELECT 
USING (type = 'public' AND is_active = true);

CREATE POLICY "Private communities viewable by members" 
ON public.communities FOR SELECT 
USING (
  type != 'public' AND 
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = communities.id AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Community owners can manage their communities" 
ON public.communities FOR ALL 
USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all communities" 
ON public.communities FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for community_members
CREATE POLICY "Community members can view other members" 
ON public.community_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = community_members.community_id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join public communities" 
ON public.community_members FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.communities c 
    WHERE c.id = community_id AND c.type = 'public' AND c.is_active = true
  )
);

CREATE POLICY "Community admins can manage members" 
ON public.community_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = community_members.community_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin')
  )
);

-- RLS Policies for community_channels
CREATE POLICY "Community members can view channels" 
ON public.community_channels FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = community_channels.community_id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Community admins can manage channels" 
ON public.community_channels FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.community_members cm 
    WHERE cm.community_id = community_channels.community_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin', 'moderator')
  )
);

-- RLS Policies for community_messages
CREATE POLICY "Community members can view messages" 
ON public.community_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.community_channels cc
    JOIN public.community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = community_messages.channel_id 
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Community members can send messages" 
ON public.community_messages FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.community_channels cc
    JOIN public.community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = channel_id 
    AND cm.user_id = auth.uid()
    AND NOT cm.is_muted
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.community_messages FOR UPDATE 
USING (sender_id = auth.uid());

CREATE POLICY "Community moderators can manage messages" 
ON public.community_messages FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.community_channels cc
    JOIN public.community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = community_messages.channel_id 
    AND cm.user_id = auth.uid() 
    AND cm.role IN ('owner', 'admin', 'moderator')
  )
);

-- Create indexes for performance
CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX idx_community_channels_community_id ON public.community_channels(community_id);
CREATE INDEX idx_community_messages_channel_id ON public.community_messages(channel_id);
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON public.community_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update member count
CREATE TRIGGER update_member_count_trigger
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();

-- Insert default communities
INSERT INTO public.communities (name, description, type, category, created_by) VALUES
('Radio Vybbi Live', 'Discussions en direct pendant les émissions radio', 'public', 'radio', (SELECT id FROM auth.users LIMIT 1)),
('Artistes Hip-Hop', 'Communauté dédiée aux artistes de hip-hop', 'public', 'genre', (SELECT id FROM auth.users LIMIT 1)),
('Agents & Managers', 'Espace d''échange pour les professionnels', 'public', 'professional', (SELECT id FROM auth.users LIMIT 1)),
('Lieux & Événements', 'Discussions entre organisateurs d''événements', 'public', 'venues', (SELECT id FROM auth.users LIMIT 1)),
('Salon Influenceurs', 'Espace privé pour les ambassadeurs Vybbi', 'private', 'influencers', (SELECT id FROM auth.users LIMIT 1));

-- Create default channels for each community
INSERT INTO public.community_channels (community_id, name, description, type) 
SELECT 
  c.id,
  CASE 
    WHEN c.category = 'radio' THEN 'Live Chat'
    ELSE 'Général'
  END,
  CASE 
    WHEN c.category = 'radio' THEN 'Discussion en direct pendant les émissions'
    ELSE 'Discussions générales de la communauté'
  END,
  CASE 
    WHEN c.category = 'radio' THEN 'live_radio'
    ELSE 'text'
  END
FROM public.communities c;