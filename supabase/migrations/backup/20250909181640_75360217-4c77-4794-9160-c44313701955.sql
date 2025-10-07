-- Add image_url field to annonces table
ALTER TABLE public.annonces ADD COLUMN image_url text;

-- Create annonces bucket for storing announcement images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('annonces', 'annonces', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload images to annonces bucket
CREATE POLICY "Users can upload images to annonces bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'annonces' AND auth.uid() IS NOT NULL);

-- Create policy to allow users to view their own annonce images
CREATE POLICY "Users can view their own annonce images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'annonces' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow public access to published annonce images
CREATE POLICY "Public can view annonce images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'annonces');

-- Create policy to allow users to update their own annonce images
CREATE POLICY "Users can update their own annonce images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'annonces' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own annonce images
CREATE POLICY "Users can delete their own annonce images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'annonces' AND auth.uid()::text = (storage.foldername(name))[1]);