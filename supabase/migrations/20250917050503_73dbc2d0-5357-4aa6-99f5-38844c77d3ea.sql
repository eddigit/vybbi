-- Créer les triggers pour les notifications admin booking
DROP TRIGGER IF EXISTS on_booking_request_admin_notification ON public.bookings;
CREATE TRIGGER on_booking_request_admin_notification
  AFTER INSERT ON public.bookings
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_admin_on_booking_activity();

DROP TRIGGER IF EXISTS on_booking_status_change_admin_notification ON public.bookings;
CREATE TRIGGER on_booking_status_change_admin_notification
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_admin_on_booking_activity();