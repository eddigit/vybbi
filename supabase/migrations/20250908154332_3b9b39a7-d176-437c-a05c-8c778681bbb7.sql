-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'artist', 'agent', 'manager', 'lieu');
CREATE TYPE public.profile_type AS ENUM ('artist', 'agent', 'manager', 'lieu');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE public.annonce_status AS ENUM ('draft', 'published', 'closed', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE public.conversation_type AS ENUM ('direct', 'group');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_type profile_type NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  genres TEXT[],
  experience TEXT,
  website TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create annonces table
CREATE TABLE public.annonces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_date DATE,
  deadline DATE,
  status annonce_status NOT NULL DEFAULT 'draft',
  budget_min INTEGER,
  budget_max INTEGER,
  genres TEXT[],
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on annonces
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;

-- Create policies for annonces
CREATE POLICY "Published annonces are viewable by everyone" 
ON public.annonces 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can view their own annonces" 
ON public.annonces 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own annonces" 
ON public.annonces 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annonces" 
ON public.annonces 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create media_assets table
CREATE TABLE public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  media_type media_type NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_assets
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for media_assets
CREATE POLICY "Media assets viewable through public profiles" 
ON public.media_assets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = media_assets.profile_id 
  AND profiles.is_public = true
));

CREATE POLICY "Users can view their own media assets" 
ON public.media_assets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = media_assets.profile_id 
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create media for their profiles" 
ON public.media_assets 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = media_assets.profile_id 
  AND profiles.user_id = auth.uid()
));

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_profile_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Reviews are viewable through public profiles" 
ON public.reviews 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = reviews.reviewed_profile_id 
  AND profiles.is_public = true
));

CREATE POLICY "Users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_annonces_updated_at
  BEFORE UPDATE ON public.annonces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile if metadata contains profile info
  IF NEW.raw_user_meta_data ? 'display_name' AND NEW.raw_user_meta_data ? 'profile_type' THEN
    INSERT INTO public.profiles (user_id, display_name, profile_type)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'display_name',
      (NEW.raw_user_meta_data ->> 'profile_type')::profile_type
    );
    
    -- Insert user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data ->> 'profile_type')::app_role
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();