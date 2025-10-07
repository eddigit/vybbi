-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false);

-- Create message_attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations" 
ON public.message_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attachments for their messages" 
ON public.message_attachments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid() AND m.sender_id = auth.uid()
  )
);

-- Create storage policies for message attachments
CREATE POLICY "Users can view attachments in their conversations" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM public.message_attachments ma
    JOIN public.messages m ON m.id = ma.message_id
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE ma.file_url = storage.objects.name AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload attachments for their messages" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);