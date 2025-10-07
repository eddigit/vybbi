-- Corriger les fonctions pour respecter les bonnes pratiques de sécurité
CREATE OR REPLACE FUNCTION public.lock_and_process_tasks(max_tasks integer DEFAULT 50)
RETURNS TABLE(
  task_id uuid,
  prospect_id uuid,
  task_type text,
  title text,
  description text,
  scheduled_at timestamp with time zone,
  template_data jsonb,
  prospect_data jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_time timestamp with time zone := now();
  lock_session_id uuid := gen_random_uuid();
BEGIN
  -- Verrouiller les tâches éligibles au traitement
  UPDATE public.prospect_tasks 
  SET 
    processing_status = 'processing',
    locked_at = current_time,
    processing_by = lock_session_id,
    execution_attempt = execution_attempt + 1
  WHERE id IN (
    SELECT pt.id 
    FROM public.prospect_tasks pt
    WHERE pt.status = 'pending' 
      AND pt.processing_status = 'waiting'
      AND pt.scheduled_at <= current_time
      AND (pt.locked_at IS NULL OR pt.locked_at < current_time - INTERVAL '30 minutes')
    ORDER BY pt.scheduled_at ASC
    LIMIT max_tasks
    FOR UPDATE SKIP LOCKED
  );

  -- Retourner les tâches verrouillées avec les données du prospect
  RETURN QUERY
  SELECT 
    pt.id as task_id,
    pt.prospect_id,
    pt.task_type,
    pt.title,
    pt.description,
    pt.scheduled_at,
    pt.template_data,
    jsonb_build_object(
      'contact_name', p.contact_name,
      'company_name', p.company_name,
      'email', p.email,
      'phone', p.phone,
      'whatsapp_number', p.whatsapp_number,
      'prospect_type', p.prospect_type,
      'status', p.status
    ) as prospect_data
  FROM public.prospect_tasks pt
  JOIN public.prospects p ON p.id = pt.prospect_id
  WHERE pt.processing_by = lock_session_id
    AND pt.processing_status = 'processing';
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_task_processing(
  task_id uuid,
  new_status text,
  error_message text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prospect_tasks 
  SET 
    status = new_status,
    processing_status = new_status,
    completed_at = CASE WHEN new_status IN ('completed', 'skipped', 'failed') THEN now() ELSE completed_at END,
    locked_at = NULL,
    processing_by = NULL,
    last_error_message = error_message
  WHERE id = task_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_task_locks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cleaned_count integer;
BEGIN
  UPDATE public.prospect_tasks 
  SET 
    processing_status = 'waiting',
    locked_at = NULL,
    processing_by = NULL
  WHERE processing_status = 'processing' 
    AND locked_at < now() - INTERVAL '30 minutes';
    
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_task_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Quand le status change, ajuster processing_status si nécessaire
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'pending' THEN
        NEW.processing_status := 'waiting';
      WHEN 'completed', 'skipped', 'failed' THEN
        NEW.processing_status := NEW.status;
        NEW.locked_at := NULL;
        NEW.processing_by := NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;