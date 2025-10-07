-- Create triggers for automatic notifications

-- Function to trigger notification on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_user_id UUID;
  sender_profile RECORD;
  recipient_profile RECORD;
BEGIN
  -- Get the recipient user ID (the other participant in the conversation)
  SELECT user_id INTO recipient_user_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get sender profile info
  SELECT * INTO sender_profile
  FROM profiles
  WHERE user_id = NEW.sender_id;

  -- Get recipient profile info  
  SELECT * INTO recipient_profile
  FROM profiles
  WHERE user_id = recipient_user_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    recipient_user_id,
    'new_message'::notification_type,
    'Nouveau message reçu',
    format('Vous avez reçu un nouveau message de %s', COALESCE(sender_profile.display_name, 'un utilisateur')),
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'senderName', COALESCE(sender_profile.display_name, 'Utilisateur'),
      'recipientName', COALESCE(recipient_profile.display_name, 'Utilisateur'),
      'message', NEW.content,
      'messagePreview', CASE 
        WHEN length(NEW.content) > 100 THEN substring(NEW.content, 1, 100) || '...'
        ELSE NEW.content
      END
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Function to trigger notification on agent request
CREATE OR REPLACE FUNCTION public.notify_agent_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artist_user_id UUID;
  agent_profile RECORD;
  artist_profile RECORD;
BEGIN
  -- Only trigger on new requests
  IF NEW.representation_status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Get artist user ID
  SELECT user_id INTO artist_user_id
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  IF artist_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get agent profile info
  SELECT * INTO agent_profile
  FROM profiles
  WHERE id = NEW.agent_profile_id;

  -- Get artist profile info
  SELECT * INTO artist_profile
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    artist_user_id,
    'agent_request'::notification_type,
    'Nouvelle demande de représentation',
    format('%s souhaite devenir votre agent', COALESCE(agent_profile.display_name, 'Un agent')),
    jsonb_build_object(
      'agent_profile_id', NEW.agent_profile_id,
      'agentName', COALESCE(agent_profile.display_name, 'Agent'),
      'artistName', COALESCE(artist_profile.display_name, 'Artiste'),
      'message', NEW.contract_notes
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Function to trigger notification on manager request
CREATE OR REPLACE FUNCTION public.notify_manager_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artist_user_id UUID;
  manager_profile RECORD;
  artist_profile RECORD;
BEGIN
  -- Only trigger on new requests
  IF NEW.representation_status != 'pending' THEN
    RETURN NEW;
  END IF;

  -- Get artist user ID
  SELECT user_id INTO artist_user_id
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  IF artist_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get manager profile info
  SELECT * INTO manager_profile
  FROM profiles
  WHERE id = NEW.manager_profile_id;

  -- Get artist profile info
  SELECT * INTO artist_profile
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    artist_user_id,
    'manager_request'::notification_type,
    'Nouvelle demande de management',
    format('%s souhaite devenir votre manager', COALESCE(manager_profile.display_name, 'Un manager')),
    jsonb_build_object(
      'manager_profile_id', NEW.manager_profile_id,
      'managerName', COALESCE(manager_profile.display_name, 'Manager'),
      'artistName', COALESCE(artist_profile.display_name, 'Artiste'),
      'message', NEW.contract_notes
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Function to trigger notification on booking request
CREATE OR REPLACE FUNCTION public.notify_booking_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artist_user_id UUID;
  artist_profile RECORD;
  venue_profile RECORD;
  event_info RECORD;
BEGIN
  -- Only trigger on new bookings
  IF NEW.status != 'proposed' THEN
    RETURN NEW;
  END IF;

  -- Get artist user ID
  SELECT user_id INTO artist_user_id
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  IF artist_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get artist profile info
  SELECT * INTO artist_profile
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  -- Get venue profile info
  SELECT * INTO venue_profile
  FROM profiles
  WHERE id = NEW.venue_profile_id;

  -- Get event info
  SELECT * INTO event_info
  FROM events
  WHERE id = NEW.event_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    artist_user_id,
    'booking_request'::notification_type,
    'Nouvelle demande de booking',
    format('Vous avez reçu une demande de booking de %s', COALESCE(venue_profile.display_name, 'un lieu')),
    jsonb_build_object(
      'booking_id', NEW.id,
      'event_id', NEW.event_id,
      'venue_profile_id', NEW.venue_profile_id,
      'artistName', COALESCE(artist_profile.display_name, 'Artiste'),
      'venueName', COALESCE(venue_profile.display_name, 'Lieu'),
      'eventTitle', COALESCE(event_info.title, 'Événement'),
      'eventDate', COALESCE(event_info.event_date::text, 'Date non spécifiée'),
      'proposedFee', NEW.proposed_fee,
      'message', NEW.message
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Function to trigger notification on review received
CREATE OR REPLACE FUNCTION public.notify_review_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  artist_user_id UUID;
  artist_profile RECORD;
  reviewer_profile RECORD;
BEGIN
  -- Get artist user ID
  SELECT user_id INTO artist_user_id
  FROM profiles
  WHERE id = NEW.reviewed_profile_id;

  IF artist_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get artist profile info
  SELECT * INTO artist_profile
  FROM profiles
  WHERE id = NEW.reviewed_profile_id;

  -- Get reviewer profile info
  SELECT * INTO reviewer_profile
  FROM profiles
  WHERE user_id = NEW.reviewer_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    artist_user_id,
    'review_received'::notification_type,
    'Nouvelle review reçue',
    format('Vous avez reçu une nouvelle review de %s', COALESCE(reviewer_profile.display_name, 'un utilisateur')),
    jsonb_build_object(
      'review_id', NEW.id,
      'reviewer_id', NEW.reviewer_id,
      'artistName', COALESCE(artist_profile.display_name, 'Artiste'),
      'reviewerName', COALESCE(reviewer_profile.display_name, 'Utilisateur'),
      'overallScore', NEW.overall_average,
      'talentScore', NEW.talent_score,
      'professionalismScore', NEW.professionalism_score,
      'communicationScore', NEW.communication_score,
      'comment', NEW.comment
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Function to trigger notification on application received
CREATE OR REPLACE FUNCTION public.notify_application_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  annonce_owner_user_id UUID;
  applicant_profile RECORD;
  annonce_info RECORD;
BEGIN
  -- Get annonce owner user ID
  SELECT user_id INTO annonce_owner_user_id
  FROM annonces
  WHERE id = NEW.annonce_id;

  IF annonce_owner_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get applicant profile info
  SELECT * INTO applicant_profile
  FROM profiles
  WHERE id = NEW.applicant_id;

  -- Get annonce info
  SELECT * INTO annonce_info
  FROM annonces
  WHERE id = NEW.annonce_id;

  -- Create notification
  PERFORM public.create_notification_with_email(
    annonce_owner_user_id,
    'application_received'::notification_type,
    'Nouvelle candidature reçue',
    format('Vous avez reçu une candidature de %s', COALESCE(applicant_profile.display_name, 'un artiste')),
    jsonb_build_object(
      'application_id', NEW.id,
      'annonce_id', NEW.annonce_id,
      'applicant_id', NEW.applicant_id,
      'applicantName', COALESCE(applicant_profile.display_name, 'Artiste'),
      'annonceTitle', COALESCE(annonce_info.title, 'Annonce'),
      'message', NEW.message
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

DROP TRIGGER IF EXISTS trigger_notify_agent_request ON agent_artists;
CREATE TRIGGER trigger_notify_agent_request
  AFTER INSERT ON agent_artists
  FOR EACH ROW EXECUTE FUNCTION notify_agent_request();

DROP TRIGGER IF EXISTS trigger_notify_manager_request ON manager_artists;
CREATE TRIGGER trigger_notify_manager_request
  AFTER INSERT ON manager_artists
  FOR EACH ROW EXECUTE FUNCTION notify_manager_request();

DROP TRIGGER IF EXISTS trigger_notify_booking_request ON bookings;
CREATE TRIGGER trigger_notify_booking_request
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_booking_request();

DROP TRIGGER IF EXISTS trigger_notify_review_received ON detailed_reviews;
CREATE TRIGGER trigger_notify_review_received
  AFTER INSERT ON detailed_reviews
  FOR EACH ROW EXECUTE FUNCTION notify_review_received();

DROP TRIGGER IF EXISTS trigger_notify_application_received ON applications;
CREATE TRIGGER trigger_notify_application_received
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_received();