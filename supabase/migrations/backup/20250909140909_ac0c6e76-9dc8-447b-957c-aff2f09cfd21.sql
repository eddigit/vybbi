-- Add contact preference fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN accepts_direct_contact BOOLEAN DEFAULT true,
ADD COLUMN preferred_contact_profile_id UUID;

-- Add foreign key constraint for preferred contact
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_preferred_contact_profile 
FOREIGN KEY (preferred_contact_profile_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;