-- Create comprehensive notification system tables

-- Notification types enum
CREATE TYPE notification_type AS ENUM (
  'new_message',
  'agent_request',
  'manager_request', 
  'booking_request',
  'booking_confirmed',
  'booking_cancelled',
  'review_received',
  'profile_view',
  'application_received',
  'application_accepted',
  'application_rejected'
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE NULL,
  related_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Update timestamp trigger
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS for preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update timestamp trigger for preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification with email
CREATE OR REPLACE FUNCTION public.create_notification_with_email(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  user_email TEXT;
  email_enabled BOOLEAN := TRUE;
BEGIN
  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, data, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_related_id)
  RETURNING id INTO notification_id;
  
  -- Check if email notifications are enabled for this type
  SELECT np.email_enabled INTO email_enabled
  FROM public.notification_preferences np
  WHERE np.user_id = p_user_id AND np.notification_type = p_type;
  
  -- If no preference found, default to enabled
  IF email_enabled IS NULL THEN
    email_enabled := TRUE;
  END IF;
  
  -- Send email if enabled
  IF email_enabled THEN
    -- Get user email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = p_user_id;
    
    IF user_email IS NOT NULL THEN
      -- Call email sending function asynchronously
      PERFORM public.send_notification_email(notification_id, user_email, p_type, p_title, p_message, p_data);
    END IF;
  END IF;
  
  RETURN notification_id;
END;
$$;

-- Function to send notification emails (will be implemented in edge function)
CREATE OR REPLACE FUNCTION public.send_notification_email(
  p_notification_id UUID,
  p_user_email TEXT,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This is a placeholder - actual email sending will be done via edge function
  -- Mark notification as email sent
  UPDATE public.notifications
  SET email_sent = TRUE, email_sent_at = NOW()
  WHERE id = p_notification_id;
END;
$$;