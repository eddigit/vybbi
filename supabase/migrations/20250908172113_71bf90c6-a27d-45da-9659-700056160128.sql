-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID NOT NULL,
  annonce_id UUID NOT NULL REFERENCES public.annonces(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_artists table for agent-artist relationships
CREATE TABLE public.agent_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_profile_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_profile_id, artist_profile_id)
);

-- Create manager_artists table for manager-artist relationships
CREATE TABLE public.manager_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_profile_id UUID NOT NULL,
  artist_profile_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manager_profile_id, artist_profile_id)
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type conversation_type NOT NULL DEFAULT 'direct',
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability_slots table
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status availability_status NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_participants junction table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can view applications for their annonces" 
ON public.applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.annonces a 
    JOIN public.profiles p ON a.user_id = p.user_id 
    WHERE a.id = applications.annonce_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = applications.applicant_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = applications.applicant_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Annonce owners can update application status" 
ON public.applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.annonces a 
    JOIN public.profiles p ON a.user_id = p.user_id 
    WHERE a.id = applications.annonce_id AND p.user_id = auth.uid()
  )
);

-- RLS Policies for agent_artists
CREATE POLICY "Agents can view their artists" 
ON public.agent_artists 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = agent_artists.agent_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Artists can view their agents" 
ON public.agent_artists 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = agent_artists.artist_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage their artist relationships" 
ON public.agent_artists 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = agent_artists.agent_profile_id AND p.user_id = auth.uid()
  )
);

-- RLS Policies for manager_artists (similar to agent_artists)
CREATE POLICY "Managers can view their artists" 
ON public.manager_artists 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = manager_artists.manager_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Artists can view their managers" 
ON public.manager_artists 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = manager_artists.artist_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Managers can manage their artist relationships" 
ON public.manager_artists 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = manager_artists.manager_profile_id AND p.user_id = auth.uid()
  )
);

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

-- RLS Policies for availability_slots
CREATE POLICY "Artists can manage their availability" 
ON public.availability_slots 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = availability_slots.artist_profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view available slots" 
ON public.availability_slots 
FOR SELECT 
USING (status = 'available');

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view their own participation" 
ON public.conversation_participants 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can join conversations" 
ON public.conversation_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at
BEFORE UPDATE ON public.availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();