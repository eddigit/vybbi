-- Add unique constraint to message_receipts for proper upsert
-- This prevents 409 conflicts when marking messages as read

ALTER TABLE public.message_receipts 
ADD CONSTRAINT message_receipts_conversation_user_unique 
UNIQUE (conversation_id, user_id);