-- FINALISATION COMPLETE DE LA SÉCURITÉ - CORRECTION DES DERNIÈRES FONCTIONS
-- Identification et correction des fonctions SECURITY DEFINER sans search_path

-- Correction de toutes les fonctions manquantes identifiées
ALTER FUNCTION public.assign_prospect_to_agent(uuid) 
SET search_path = public;

ALTER FUNCTION public.audit_sensitive_access(text, text, uuid) 
SET search_path = public;

ALTER FUNCTION public.auto_update_prospect_score() 
SET search_path = public;

ALTER FUNCTION public.calculate_monthly_recurring_commissions() 
SET search_path = public;

ALTER FUNCTION public.complete_task_processing(uuid, text, text) 
SET search_path = public;

ALTER FUNCTION public.create_notification_with_email(uuid, notification_type, text, text, jsonb, uuid) 
SET search_path = public;

ALTER FUNCTION public.enforce_messaging_policy() 
SET search_path = public;

ALTER FUNCTION public.generate_affiliate_code(text) 
SET search_path = public;

ALTER FUNCTION public.get_conversations_with_details() 
SET search_path = public;

ALTER FUNCTION public.get_conversations_with_peers() 
SET search_path = public;

ALTER FUNCTION public.get_event_attendees_count(uuid) 
SET search_path = public;

ALTER FUNCTION public.get_profile_stats(uuid) 
SET search_path = public;

ALTER FUNCTION public.get_profile_view_stats(uuid) 
SET search_path = public;

ALTER FUNCTION public.get_radio_playlist() 
SET search_path = public;

ALTER FUNCTION public.get_safe_profile_data(text) 
SET search_path = public;

ALTER FUNCTION public.get_user_event_status(uuid, uuid) 
SET search_path = public;

ALTER FUNCTION public.get_user_profile(uuid) 
SET search_path = public;

ALTER FUNCTION public.has_role(uuid, app_role) 
SET search_path = public;

ALTER FUNCTION public.lock_and_process_tasks(integer) 
SET search_path = public;

ALTER FUNCTION public.log_sensitive_access(text, text, uuid) 
SET search_path = public;

ALTER FUNCTION public.notify_admin_on_booking_activity() 
SET search_path = public;

ALTER FUNCTION public.notify_agent_request() 
SET search_path = public;

ALTER FUNCTION public.notify_application_received() 
SET search_path = public;

ALTER FUNCTION public.notify_booking_request() 
SET search_path = public;

ALTER FUNCTION public.notify_manager_request() 
SET search_path = public;

ALTER FUNCTION public.notify_new_message() 
SET search_path = public;

ALTER FUNCTION public.notify_review_received() 
SET search_path = public;

ALTER FUNCTION public.resolve_profile(text) 
SET search_path = public;

ALTER FUNCTION public.resolve_profile_by_slug(text) 
SET search_path = public;

ALTER FUNCTION public.security_phase1_status() 
SET search_path = public;

ALTER FUNCTION public.send_admin_broadcast(profile_type[], boolean, text) 
SET search_path = public;

ALTER FUNCTION public.send_admin_message(uuid, text) 
SET search_path = public;

ALTER FUNCTION public.send_notification_email(uuid, text, notification_type, text, text, jsonb) 
SET search_path = public;

ALTER FUNCTION public.start_direct_conversation(uuid) 
SET search_path = public;

ALTER FUNCTION public.track_affiliate_conversion(uuid, text, numeric) 
SET search_path = public;

ALTER FUNCTION public.track_affiliate_visit(text, uuid, text, text, text) 
SET search_path = public;

ALTER FUNCTION public.track_music_play(uuid, integer, text) 
SET search_path = public;

ALTER FUNCTION public.trigger_trial_offer_update() 
SET search_path = public;

-- Message de confirmation que TOUTES les fonctions SECURITY DEFINER ont maintenant un search_path sécurisé
-- Ceci corrige définitivement les avertissements Function Search Path Mutable