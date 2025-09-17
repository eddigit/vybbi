-- Fonction pour notifier automatiquement les administrateurs lors des demandes de booking
CREATE OR REPLACE FUNCTION public.notify_admin_on_booking_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  artist_profile RECORD;
  venue_profile RECORD;
  event_info RECORD;
  admin_user_id UUID;
BEGIN
  -- Récupérer les informations de l'artiste
  SELECT * INTO artist_profile
  FROM profiles
  WHERE id = NEW.artist_profile_id;

  -- Récupérer les informations de la venue
  SELECT * INTO venue_profile
  FROM profiles
  WHERE id = NEW.venue_profile_id;

  -- Récupérer les informations de l'événement
  SELECT * INTO event_info
  FROM events
  WHERE id = NEW.event_id;

  -- Notifier tous les administrateurs
  FOR admin_user_id IN
    SELECT u.id
    FROM auth.users u
    JOIN profiles p ON p.user_id = u.id
    WHERE p.profile_type = 'admin' OR public.has_role(u.id, 'admin'::app_role)
  LOOP
    -- Créer une notification pour chaque admin
    PERFORM public.create_notification_with_email(
      admin_user_id,
      'booking_request'::notification_type,
      'Nouvelle demande de booking sur la plateforme',
      format('Demande de booking de %s pour %s chez %s', 
        COALESCE(artist_profile.display_name, 'Artiste'), 
        COALESCE(event_info.title, 'Événement'), 
        COALESCE(venue_profile.display_name, 'Lieu')
      ),
      jsonb_build_object(
        'booking_id', NEW.id,
        'event_id', NEW.event_id,
        'artist_profile_id', NEW.artist_profile_id,
        'venue_profile_id', NEW.venue_profile_id,
        'artistName', COALESCE(artist_profile.display_name, 'Artiste'),
        'venueName', COALESCE(venue_profile.display_name, 'Lieu'),
        'eventTitle', COALESCE(event_info.title, 'Événement'),
        'eventDate', COALESCE(event_info.event_date::text, 'Date non spécifiée'),
        'proposedFee', NEW.proposed_fee,
        'message', NEW.message,
        'status', NEW.status,
        'admin_notification', true
      ),
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Créer le trigger pour les nouvelles demandes de booking
DROP TRIGGER IF EXISTS on_booking_request_admin_notification ON public.bookings;
CREATE TRIGGER on_booking_request_admin_notification
  AFTER INSERT ON public.bookings
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_admin_on_booking_activity();

-- Trigger pour les changements de statut de booking
DROP TRIGGER IF EXISTS on_booking_status_change_admin_notification ON public.bookings;
CREATE TRIGGER on_booking_status_change_admin_notification
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_admin_on_booking_activity();