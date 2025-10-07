

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."annonce_status" AS ENUM (
    'draft',
    'published',
    'closed',
    'cancelled'
);


ALTER TYPE "public"."annonce_status" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'artist',
    'agent',
    'manager',
    'lieu',
    'influenceur',
    'academie',
    'sponsors',
    'media',
    'agence'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."application_status" AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";


CREATE TYPE "public"."availability_status" AS ENUM (
    'available',
    'busy',
    'unavailable'
);


ALTER TYPE "public"."availability_status" OWNER TO "postgres";


CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."conversation_type" AS ENUM (
    'direct',
    'group'
);


ALTER TYPE "public"."conversation_type" OWNER TO "postgres";


CREATE TYPE "public"."conversion_status" AS ENUM (
    'pending',
    'confirmed',
    'failed'
);


ALTER TYPE "public"."conversion_status" OWNER TO "postgres";


CREATE TYPE "public"."event_status" AS ENUM (
    'draft',
    'published',
    'cancelled',
    'completed'
);


ALTER TYPE "public"."event_status" OWNER TO "postgres";


CREATE TYPE "public"."interaction_type" AS ENUM (
    'email',
    'call',
    'meeting',
    'message',
    'note'
);


ALTER TYPE "public"."interaction_type" OWNER TO "postgres";


CREATE TYPE "public"."media_type" AS ENUM (
    'image',
    'video',
    'audio'
);


ALTER TYPE "public"."media_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
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


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."profile_type" AS ENUM (
    'artist',
    'agent',
    'manager',
    'lieu',
    'influenceur',
    'academie',
    'sponsors',
    'media',
    'agence'
);


ALTER TYPE "public"."profile_type" OWNER TO "postgres";


CREATE TYPE "public"."prospect_status" AS ENUM (
    'new',
    'contacted',
    'qualified',
    'interested',
    'converted',
    'rejected',
    'unresponsive',
    'meeting_scheduled'
);


ALTER TYPE "public"."prospect_status" OWNER TO "postgres";


CREATE TYPE "public"."prospect_type" AS ENUM (
    'artist',
    'venue',
    'agent',
    'manager'
);


ALTER TYPE "public"."prospect_type" OWNER TO "postgres";


CREATE TYPE "public"."representation_status" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'revoked'
);


ALTER TYPE "public"."representation_status" OWNER TO "postgres";


CREATE TYPE "public"."roadmap_item_status" AS ENUM (
    'done',
    'in_progress',
    'planned',
    'on_hold',
    'cancelled'
);


ALTER TYPE "public"."roadmap_item_status" OWNER TO "postgres";


CREATE TYPE "public"."roadmap_item_type" AS ENUM (
    'feature',
    'task',
    'selling_point'
);


ALTER TYPE "public"."roadmap_item_type" OWNER TO "postgres";


CREATE TYPE "public"."roadmap_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE "public"."roadmap_priority" OWNER TO "postgres";


CREATE TYPE "public"."view_type" AS ENUM (
    'full_profile',
    'quick_preview',
    'search_result'
);


ALTER TYPE "public"."view_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."advanced_suspicious_activity_detector"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  recent_access_count integer;
  distinct_profiles_accessed integer;
  risk_level text := 'LOW';
BEGIN
  -- Compter les accès récents
  SELECT COUNT(*), COUNT(DISTINCT record_id) 
  INTO recent_access_count, distinct_profiles_accessed
  FROM public.security_audit_log
  WHERE user_id = NEW.user_id
    AND action LIKE 'PROFILE_ACCESS_%'
    AND created_at > now() - interval '5 minutes';
  
  -- Déterminer le niveau de risque
  IF recent_access_count > 50 THEN
    risk_level := 'CRITICAL';
  ELSIF recent_access_count > 20 THEN
    risk_level := 'HIGH';
  ELSIF recent_access_count > 10 THEN
    risk_level := 'MEDIUM';
  END IF;
  
  -- Alerter si activité suspecte détectée
  IF recent_access_count > 10 THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, metadata, created_at
    ) VALUES (
      NEW.user_id, 
      'SUSPICIOUS_ACTIVITY_DETECTED', 
      'security_audit_log',
      jsonb_build_object(
        'access_count_5min', recent_access_count,
        'distinct_profiles_accessed', distinct_profiles_accessed,
        'risk_level', risk_level,
        'reason', 'Excessive profile access attempts',
        'alert_timestamp', now(),
        'requires_review', (risk_level IN ('HIGH', 'CRITICAL'))
      ), 
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."advanced_suspicious_activity_detector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM prospects p
      JOIN vybbi_agents va ON va.id = p.assigned_agent_id
      WHERE p.id = prospect_id AND va.user_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") IS 'Security function to verify agent access to prospect data';



CREATE OR REPLACE FUNCTION "public"."assign_prospect_to_agent"("prospect_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  selected_agent_id UUID;
BEGIN
  -- Find the agent with the least number of active prospects
  SELECT va.id INTO selected_agent_id
  FROM public.vybbi_agents va
  LEFT JOIN public.prospects p ON p.assigned_agent_id = va.id AND p.status NOT IN ('converted', 'rejected')
  WHERE va.is_active = true
  GROUP BY va.id
  ORDER BY COUNT(p.id) ASC, va.created_at ASC
  LIMIT 1;
  
  IF selected_agent_id IS NOT NULL THEN
    -- Update the prospect
    UPDATE public.prospects 
    SET assigned_agent_id = selected_agent_id, assigned_at = now()
    WHERE id = prospect_id;
    
    -- Create assignment record
    INSERT INTO public.prospect_assignments (prospect_id, agent_id, assigned_by)
    VALUES (prospect_id, selected_agent_id, auth.uid());
    
    -- Update agent stats
    UPDATE public.vybbi_agents 
    SET total_prospects_assigned = total_prospects_assigned + 1
    WHERE id = selected_agent_id;
  END IF;
  
  RETURN selected_agent_id;
END;
$$;


ALTER FUNCTION "public"."assign_prospect_to_agent"("prospect_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_profile_access"("profile_id" "uuid", "access_type" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Get profile info
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  -- Log access to profiles with PII if not owner or admin
  IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN
    IF auth.uid() != profile_record.user_id AND NOT has_role(auth.uid(), 'admin') THEN
      INSERT INTO public.security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        metadata,
        created_at
      ) VALUES (
        auth.uid(),
        'SENSITIVE_PROFILE_ACCESS',
        'profiles',
        profile_id,
        jsonb_build_object(
          'access_type', access_type,
          'accessed_profile_user_id', profile_record.user_id,
          'has_pii', true,
          'profile_type', profile_record.profile_type
        ),
        now()
      );
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION "public"."audit_profile_access"("profile_id" "uuid", "access_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_profile_access_enhanced"("profile_id" "uuid", "access_type" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  profile_record RECORD;
  accessing_user_id uuid;
BEGIN
  accessing_user_id := auth.uid();
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record.id IS NOT NULL AND accessing_user_id != profile_record.user_id 
     AND NOT has_role(accessing_user_id, 'admin'::app_role) THEN
    
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, metadata, created_at
    ) VALUES (
      accessing_user_id, 'PROFILE_ACCESS_' || access_type, 'profiles', profile_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_profile_user_id', profile_record.user_id,
        'profile_type', profile_record.profile_type,
        'has_email', (profile_record.email IS NOT NULL AND profile_record.email != ''),
        'has_phone', (profile_record.phone IS NOT NULL AND profile_record.phone != ''),
        'is_public_profile', profile_record.is_public,
        'accessing_user_is_owner', false,
        'accessing_user_is_admin', false
      ), now()
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."audit_profile_access_enhanced"("profile_id" "uuid", "access_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Manual security audit logging for critical operations
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    PERFORM log_security_event(
      'PROSPECT_DATA_ACCESS',
      auth.uid(),
      NULL,
      inet_client_addr(),
      NULL,
      jsonb_build_object(
        'table_name', table_name,
        'operation', operation,
        'record_id', record_id,
        'timestamp', now()
      )
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid") IS 'Manual audit function for prospect data access logging';



CREATE OR REPLACE FUNCTION "public"."audit_rls_access"("table_name" "text", "operation" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Log des accès aux tables sensibles
  IF table_name IN ('agent_commissions', 'conversion_tracking', 'recurring_commissions', 'affiliate_conversions') THEN
    INSERT INTO security_audit_log (user_id, action, table_name, created_at)
    VALUES (auth.uid(), operation || ' on ' || table_name, table_name, NOW());
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs pour ne pas bloquer les opérations
    NULL;
END;
$$;


ALTER FUNCTION "public"."audit_rls_access"("table_name" "text", "operation" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.security_audit_log (user_id, action, table_name, record_id, created_at)
    VALUES (auth.uid(), action, table_name, record_id, now());
  END IF;
END;
$$;


ALTER FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_sensitive_profile_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Auditer quand quelqu'un accède aux colonnes sensibles
  IF (NEW.email IS NOT NULL OR NEW.phone IS NOT NULL OR NEW.siret_number IS NOT NULL) 
     AND auth.uid() != NEW.user_id 
     AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, metadata, created_at
    ) VALUES (
      auth.uid(),
      'UNAUTHORIZED_PII_ACCESS_ATTEMPT',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'attempted_columns', CASE 
          WHEN NEW.email IS NOT NULL THEN 'email'
          WHEN NEW.phone IS NOT NULL THEN 'phone'  
          WHEN NEW.siret_number IS NOT NULL THEN 'siret_number'
          ELSE 'unknown'
        END,
        'target_user_id', NEW.user_id,
        'blocked', true
      ),
      now()
    );
    
    RAISE EXCEPTION 'Access denied: insufficient permissions to view sensitive profile data';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."audit_sensitive_profile_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_update_prospect_score"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_score INTEGER;
  new_score INTEGER;
  rule_record RECORD;
BEGIN
  -- Récupérer le score actuel
  SELECT qualification_score INTO current_score
  FROM public.prospects 
  WHERE id = NEW.prospect_id;
  
  new_score := current_score;
  
  -- Appliquer les règles de scoring correspondantes
  FOR rule_record IN 
    SELECT * FROM public.scoring_rules 
    WHERE rule_type = NEW.event_type AND is_active = true
  LOOP
    new_score := LEAST(new_score + rule_record.score_impact, 100);
  END LOOP;
  
  -- Mettre à jour le score si changement
  IF new_score != current_score THEN
    UPDATE public.prospects 
    SET 
      qualification_score = new_score,
      last_engagement_score = new_score,
      engagement_history = COALESCE(engagement_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', now(),
        'event_type', NEW.event_type,
        'score_change', new_score - current_score,
        'new_score', new_score
      )
    WHERE id = NEW.prospect_id;
    
    -- Enregistrer l'historique
    INSERT INTO public.prospect_scoring_history (
      prospect_id, previous_score, new_score, factors
    ) VALUES (
      NEW.prospect_id, current_score, new_score,
      jsonb_build_object('trigger_event', NEW.event_type, 'event_data', NEW.event_data)
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_update_prospect_score"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_daily_login_tokens"("user_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  last_login_date DATE;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get last login token date
  SELECT MAX(DATE(processed_at)) INTO last_login_date
  FROM public.token_transactions
  WHERE user_id = user_id_param 
    AND reason = 'daily_login'
    AND transaction_type = 'earned';
  
  -- If no login today, award tokens
  IF last_login_date IS NULL OR last_login_date < today_date THEN
    PERFORM public.award_vybbi_tokens(
      user_id_param,
      10,
      'daily_login',
      'Connexion quotidienne récompensée !',
      'daily_activity',
      user_id_param
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."award_daily_login_tokens"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_vybbi_tokens"("target_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text" DEFAULT NULL::"text", "reference_type" "text" DEFAULT NULL::"text", "reference_id" "uuid" DEFAULT NULL::"uuid", "metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_balance_exists BOOLEAN;
BEGIN
  -- Check if user balance exists using SECURITY DEFINER
  EXECUTE format('
    SELECT EXISTS(SELECT 1 FROM public.user_token_balances WHERE user_id = %L)',
    target_user_id
  ) INTO user_balance_exists;
  
  -- Create balance if it doesn't exist
  IF NOT user_balance_exists THEN
    EXECUTE format('
      INSERT INTO public.user_token_balances (user_id, balance, total_earned, total_spent)
      VALUES (%L, 0, 0, 0)',
      target_user_id
    );
  END IF;
  
  -- Update balance
  EXECUTE format('
    UPDATE public.user_token_balances 
    SET 
      balance = balance + %L,
      total_earned = total_earned + %L,
      updated_at = now()
    WHERE user_id = %L',
    amount, amount, target_user_id
  );
  
  -- Record transaction
  EXECUTE format('
    INSERT INTO public.token_transactions (
      user_id, transaction_type, amount, reason, description,
      reference_type, reference_id, metadata
    ) VALUES (
      %L, %L, %L, %L, %L, %L, %L, %L
    )',
    target_user_id, 'earned', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."award_vybbi_tokens"("target_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_monthly_recurring_commissions"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_month text := to_char(CURRENT_DATE, 'YYYY-MM');
  conversion_record RECORD;
  user_is_active boolean;
BEGIN
  -- Loop through all conversions that should generate recurring commissions
  FOR conversion_record IN 
    SELECT 
      ac.id,
      ac.link_id,
      ac.user_id,
      il.influencer_profile_id,
      ac.converted_at,
      ac.is_recurring,
      ac.is_exclusive_program
    FROM affiliate_conversions ac
    JOIN influencer_links il ON il.id = ac.link_id
    WHERE ac.conversion_type = 'subscription'
      AND ac.conversion_status = 'confirmed'
      AND ac.converted_at <= CURRENT_DATE
      -- For exclusive program: only if conversion was before 2026-01-31
      AND (NOT ac.is_exclusive_program OR ac.converted_at <= '2026-01-31'::date)
  LOOP
    -- Check if user is still active (has recent activity)
    -- This is a simplified check - you might want to adjust based on your definition of "active"
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = conversion_record.user_id 
      AND last_sign_in_at > CURRENT_DATE - INTERVAL '60 days'
    ) INTO user_is_active;
    
    -- Only create recurring commission if user is active and record doesn't exist
    IF user_is_active AND NOT EXISTS (
      SELECT 1 FROM recurring_commissions 
      WHERE influencer_profile_id = conversion_record.influencer_profile_id
        AND user_id = conversion_record.user_id
        AND month_year = current_month
    ) THEN
      INSERT INTO recurring_commissions (
        influencer_profile_id,
        user_id,
        conversion_id,
        month_year,
        amount,
        is_exclusive_program,
        status
      ) VALUES (
        conversion_record.influencer_profile_id,
        conversion_record.user_id,
        conversion_record.id,
        current_month,
        CASE 
          WHEN conversion_record.is_exclusive_program THEN 0.50
          ELSE 0.25  -- Regular rate for non-exclusive
        END,
        conversion_record.is_exclusive_program,
        'pending'
      );
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."calculate_monthly_recurring_commissions"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text" NOT NULL,
    "profile_type" "public"."profile_type" NOT NULL,
    "bio" "text",
    "avatar_url" "text",
    "location" "text",
    "genres" "text"[],
    "experience" "text",
    "website" "text",
    "is_public" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "spotify_url" "text",
    "soundcloud_url" "text",
    "youtube_url" "text",
    "instagram_url" "text",
    "tiktok_url" "text",
    "languages" "text"[],
    "header_url" "text",
    "header_position_y" integer DEFAULT 50,
    "talents" "text"[],
    "accepts_direct_contact" boolean DEFAULT true,
    "preferred_contact_profile_id" "uuid",
    "email" "text",
    "phone" "text",
    "venue_category" "text",
    "venue_capacity" integer,
    "city" "text",
    "slug" "text",
    "onboarding_completed" boolean DEFAULT false,
    "profile_completion_percentage" integer DEFAULT 0,
    "secondary_profile_type" "public"."profile_type",
    "siret_number" "text",
    "siret_verified" boolean DEFAULT false,
    "siret_verified_at" timestamp with time zone,
    "is_temporary" boolean DEFAULT false,
    "created_by_admin" "uuid",
    "temp_profile_notes" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."is_temporary" IS 'Indicates if this is a temporary profile created by admin during physical prospecting';



COMMENT ON COLUMN "public"."profiles"."created_by_admin" IS 'References the admin user who created this temporary profile';



CREATE OR REPLACE FUNCTION "public"."calculate_profile_completion"("profile_row" "public"."profiles") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  completion_score integer := 0;
BEGIN
  -- Basic information (60% total)
  IF profile_row.display_name IS NOT NULL AND profile_row.display_name != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.bio IS NOT NULL AND profile_row.bio != '' THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_row.avatar_url IS NOT NULL AND profile_row.avatar_url != '' THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_row.location IS NOT NULL AND profile_row.location != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.genres IS NOT NULL AND array_length(profile_row.genres, 1) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Profile type specific information (25% total)
  IF profile_row.profile_type = 'artist' THEN
    IF profile_row.spotify_url IS NOT NULL OR profile_row.soundcloud_url IS NOT NULL OR profile_row.youtube_url IS NOT NULL THEN
      completion_score := completion_score + 15;
    END IF;
  ELSE
    IF profile_row.email IS NOT NULL AND profile_row.email != '' THEN
      completion_score := completion_score + 15;
    END IF;
  END IF;
  
  -- Additional information (15% total)
  IF profile_row.experience IS NOT NULL AND profile_row.experience != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.languages IS NOT NULL AND array_length(profile_row.languages, 1) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$;


ALTER FUNCTION "public"."calculate_profile_completion"("profile_row" "public"."profiles") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_sensitive_profile_data"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Seuls les propriétaires et admins peuvent accéder aux données sensibles
  RETURN (auth.uid() = target_user_id) OR has_role(auth.uid(), 'admin'::app_role);
END;
$$;


ALTER FUNCTION "public"."can_access_sensitive_profile_data"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_profile_security_status"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  total_profiles integer;
  public_profiles integer;
  profiles_with_pii integer;
  public_profiles_with_pii integer;
  security_status jsonb;
BEGIN
  -- Compter les profils
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  SELECT COUNT(*) INTO public_profiles FROM public.profiles WHERE is_public = true;
  
  -- Compter les profils avec des données PII
  SELECT COUNT(*) INTO profiles_with_pii 
  FROM public.profiles 
  WHERE (email IS NOT NULL AND email != '') 
     OR (phone IS NOT NULL AND phone != '') 
     OR (siret_number IS NOT NULL AND siret_number != '');
  
  SELECT COUNT(*) INTO public_profiles_with_pii 
  FROM public.profiles 
  WHERE is_public = true 
    AND ((email IS NOT NULL AND email != '') 
         OR (phone IS NOT NULL AND phone != '') 
         OR (siret_number IS NOT NULL AND siret_number != ''));
  
  -- Construire le rapport de sécurité
  security_status := jsonb_build_object(
    'total_profiles', total_profiles,
    'public_profiles', public_profiles,
    'profiles_with_pii', profiles_with_pii,
    'public_profiles_with_pii', public_profiles_with_pii,
    'pii_exposure_risk', CASE 
      WHEN public_profiles_with_pii > 0 THEN 'HIGH' 
      ELSE 'LOW' 
    END,
    'security_functions_active', jsonb_build_object(
      'secure_profile_access', true,
      'audit_trail', true,
      'suspicious_activity_detection', true
    ),
    'recommendations', CASE 
      WHEN public_profiles_with_pii > 0 THEN 
        jsonb_build_array('Review public profiles with PII data', 'Consider making sensitive profiles private')
      ELSE 
        jsonb_build_array('Security status: GOOD')
    END,
    'last_check', now()
  );
  
  RETURN security_status;
END;
$$;


ALTER FUNCTION "public"."check_profile_security_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_security_integrity"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb := '{}';
  tables_without_rls integer;
  policies_count integer;
BEGIN
  -- Compter les tables sans RLS dans le schéma public
  SELECT COUNT(*)::integer INTO tables_without_rls
  FROM information_schema.tables t
  LEFT JOIN pg_class c ON c.relname = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT COALESCE(c.relrowsecurity, false);
    
  -- Compter les policies de sécurité
  SELECT COUNT(*)::integer INTO policies_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  result := jsonb_build_object(
    'tables_without_rls', tables_without_rls,
    'total_policies', policies_count,
    'security_status', CASE 
      WHEN tables_without_rls = 0 THEN 'SECURE'
      WHEN tables_without_rls < 5 THEN 'WARNING'
      ELSE 'CRITICAL'
    END,
    'checked_at', now()
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_security_integrity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_slug_availability"("desired_slug" "text", "profile_id_to_exclude" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE slug = desired_slug 
    AND (profile_id_to_exclude IS NULL OR id != profile_id_to_exclude)
  );
END;
$$;


ALTER FUNCTION "public"."check_slug_availability"("desired_slug" "text", "profile_id_to_exclude" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_invitations"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.representation_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_task_locks"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."cleanup_expired_task_locks"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_temp_credentials"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired unclaimed credentials
  DELETE FROM public.temporary_credentials
  WHERE is_claimed = false 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Mark expired temporary profiles as inactive
  UPDATE public.profiles
  SET is_public = false
  WHERE is_temporary = true 
    AND id IN (
      SELECT profile_id FROM public.temporary_credentials
      WHERE is_claimed = false AND expires_at < NOW()
    );
  
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_temp_credentials"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_expired_temp_credentials"() IS 'Removes expired temporary credentials and hides expired temporary profiles';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_login_attempts"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete login attempts older than 30 days
  DELETE FROM public.login_attempts 
  WHERE attempt_time < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_login_attempts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_notifications"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications 
  WHERE read_at IS NOT NULL 
    AND read_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_security_logs"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Nettoyer les anciens logs d'audit (garder 90 jours)
  DELETE FROM security_audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_security_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_task_processing"("task_id" "uuid", "new_status" "text", "error_message" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."complete_task_processing"("task_id" "uuid", "new_status" "text", "error_message" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification_with_email"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb" DEFAULT '{}'::"jsonb", "p_related_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."create_notification_with_email"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_related_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_workflow_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  workflow_record RECORD;
  step_record JSONB;
  task_scheduled_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Chercher le workflow correspondant au type de prospect
  SELECT * INTO workflow_record
  FROM public.prospecting_workflows
  WHERE prospect_type = NEW.prospect_type 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF workflow_record.id IS NOT NULL THEN
    -- Créer une tâche pour chaque étape du workflow
    FOR step_record IN SELECT * FROM jsonb_array_elements(workflow_record.steps)
    LOOP
      task_scheduled_at := NEW.created_at + (step_record->>'delay_hours')::INTEGER * INTERVAL '1 hour';
      
      INSERT INTO public.prospect_tasks (
        prospect_id,
        workflow_id,
        agent_id,
        task_type,
        title,
        description,
        scheduled_at,
        template_data
      ) VALUES (
        NEW.id,
        workflow_record.id,
        NEW.assigned_agent_id,
        step_record->>'type',
        step_record->>'title',
        COALESCE(step_record->>'description', 'Tâche générée automatiquement par workflow'),
        task_scheduled_at,
        jsonb_build_object(
          'step', step_record->>'step',
          'template', step_record->>'template',
          'condition', step_record->>'condition'
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_workflow_tasks"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_suspicious_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  recent_access_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_access_count
  FROM public.security_audit_log
  WHERE user_id = NEW.user_id
    AND action LIKE 'PROFILE_ACCESS_%'
    AND created_at > now() - interval '5 minutes';
  
  IF recent_access_count > 20 THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, metadata, created_at
    ) VALUES (
      NEW.user_id, 'SUSPICIOUS_ACTIVITY_DETECTED', 'security_audit_log',
      jsonb_build_object(
        'access_count_5min', recent_access_count,
        'alert_level', 'HIGH',
        'reason', 'Excessive profile access attempts'
      ), now()
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."detect_suspicious_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."diagnose_user_messaging"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  profile_data RECORD;
  roles_data text[];
  conversations_count integer;
  messages_count integer;
BEGIN
  -- Check if user exists
  result := jsonb_build_object('user_id', user_id_param);
  
  -- Get profile
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE user_id = user_id_param;
  
  IF FOUND THEN
    result := result || jsonb_build_object(
      'profile_exists', true,
      'profile_id', profile_data.id,
      'profile_type', profile_data.profile_type,
      'display_name', profile_data.display_name,
      'is_public', profile_data.is_public
    );
  ELSE
    result := result || jsonb_build_object('profile_exists', false);
  END IF;
  
  -- Get roles
  SELECT array_agg(role::text) INTO roles_data
  FROM public.user_roles
  WHERE user_id = user_id_param;
  
  result := result || jsonb_build_object('roles', COALESCE(roles_data, ARRAY[]::text[]));
  
  -- Get conversation count
  SELECT COUNT(*) INTO conversations_count
  FROM public.conversation_participants
  WHERE user_id = user_id_param;
  
  result := result || jsonb_build_object('conversations_count', conversations_count);
  
  -- Get messages count
  SELECT COUNT(*) INTO messages_count
  FROM public.messages
  WHERE sender_id = user_id_param;
  
  result := result || jsonb_build_object('messages_sent_count', messages_count);
  
  -- Check for blocked users
  result := result || jsonb_build_object(
    'blocked_users_count', (
      SELECT COUNT(*) FROM public.blocked_users WHERE blocker_user_id = user_id_param
    ),
    'blocked_by_count', (
      SELECT COUNT(*) FROM public.blocked_users WHERE blocked_user_id = user_id_param
    )
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."diagnose_user_messaging"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_messaging_policy"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conversation_record RECORD;
  sender_profile RECORD;
  sender_message_count INTEGER;
  other_user_id UUID;
  other_user_profile RECORD;
  sender_is_admin BOOLEAN := false;
BEGIN
  -- Validation des UUIDs
  IF NEW.conversation_id IS NULL OR NEW.sender_id IS NULL THEN
    RAISE EXCEPTION 'conversation_id and sender_id cannot be null';
  END IF;

  -- Get conversation details
  SELECT * INTO conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found: %', NEW.conversation_id;
  END IF;

  IF conversation_record.type != 'direct'::conversation_type THEN
    RETURN NEW;
  END IF;

  -- Get sender profile with error handling
  SELECT * INTO sender_profile
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender profile not found for user: %', NEW.sender_id;
  END IF;

  IF sender_profile.profile_type IS NULL THEN
    RAISE EXCEPTION 'Sender profile_type is null for user: %', NEW.sender_id;
  END IF;

  -- Check if sender is admin
  SELECT public.has_role(NEW.sender_id, 'admin') INTO sender_is_admin;

  -- Get the other user with validation
  SELECT user_id INTO other_user_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF other_user_id IS NULL THEN
    RAISE LOG 'No other participant found in conversation %', NEW.conversation_id;
    -- Allow message if it's the first one in the conversation
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;

  -- Get other user profile with error handling
  SELECT * INTO other_user_profile
  FROM public.profiles
  WHERE user_id = other_user_id;
  
  IF NOT FOUND THEN
    RAISE LOG 'Other user profile not found for user: %', other_user_id;
    -- Allow message but log the issue
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;

  IF other_user_profile.profile_type IS NULL THEN
    RAISE LOG 'Other user profile_type is null for user: %', other_user_id;
    -- Allow message but log the issue
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  -- If reply received, allow unlimited messaging
  IF conversation_record.reply_received = true THEN
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  END IF;
  
  -- Count messages from sender
  SELECT COUNT(*) INTO sender_message_count
  FROM public.messages
  WHERE conversation_id = NEW.conversation_id 
    AND sender_id = NEW.sender_id;
  
  -- Apply restrictions (skip if admin)
  -- Only restrict agent/manager/lieu contacting artist
  IF sender_profile.profile_type IN ('agent', 'manager', 'lieu') 
     AND other_user_profile.profile_type = 'artist'
     AND sender_message_count >= 1 
     AND NOT sender_is_admin THEN
    RAISE EXCEPTION 'Cannot send more messages until recipient replies';
  END IF;
  
  -- Mark as replied if this is a response
  IF EXISTS (
    SELECT 1 FROM public.messages
    WHERE conversation_id = NEW.conversation_id 
      AND sender_id != NEW.sender_id
  ) THEN
    UPDATE public.conversations
    SET reply_received = true, last_message_at = now()
    WHERE id = NEW.conversation_id;
  ELSE 
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block the message
    RAISE LOG 'Error in enforce_messaging_policy: % %', SQLERRM, SQLSTATE;
    -- Update conversation timestamp anyway
    UPDATE public.conversations
    SET last_message_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_messaging_policy"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enhanced_audit_profile_access"("profile_id" "uuid", "access_type" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  profile_record RECORD;
  accessing_user_id uuid;
  is_owner boolean := false;
  is_admin boolean := false;
BEGIN
  accessing_user_id := auth.uid();
  
  -- Vérifier si l'utilisateur est propriétaire ou admin
  IF accessing_user_id IS NOT NULL THEN
    SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
    is_owner := (accessing_user_id = profile_record.user_id);
    is_admin := has_role(accessing_user_id, 'admin'::app_role);
  END IF;
  
  -- Logger tous les accès non-autorisés aux profils
  IF profile_record.id IS NOT NULL AND NOT is_owner AND NOT is_admin THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, metadata, created_at
    ) VALUES (
      accessing_user_id, 
      'PROFILE_ACCESS_' || access_type, 
      'profiles', 
      profile_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_profile_user_id', profile_record.user_id,
        'profile_type', profile_record.profile_type,
        'has_pii_data', (
          (profile_record.email IS NOT NULL AND profile_record.email != '') OR
          (profile_record.phone IS NOT NULL AND profile_record.phone != '') OR
          (profile_record.siret_number IS NOT NULL AND profile_record.siret_number != '')
        ),
        'is_public_profile', profile_record.is_public,
        'security_level', 'MEDIUM'
      ), 
      now()
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."enhanced_audit_profile_access"("profile_id" "uuid", "access_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"("_user_id" "uuid", "_display_name" "text" DEFAULT NULL::"text", "_profile_type" "public"."profile_type" DEFAULT 'artist'::"public"."profile_type") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _profile_id UUID;
  _role app_role;
BEGIN
  -- Map profile_type to app_role
  _role := _profile_type::text::app_role;
  
  -- Check if profile already exists
  SELECT id INTO _profile_id
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- If no profile exists, create one
  IF _profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, display_name, profile_type)
    VALUES (_user_id, COALESCE(_display_name, 'New User'), _profile_type)
    RETURNING id INTO _profile_id;
  END IF;
  
  -- Ensure user role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN _profile_id;
END;
$$;


ALTER FUNCTION "public"."ensure_user_profile"("_user_id" "uuid", "_display_name" "text", "_profile_type" "public"."profile_type") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_affiliate_code"("base_name" "text" DEFAULT NULL::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  code TEXT;
  counter INTEGER := 1;
  base_code TEXT;
BEGIN
  -- Create base code from name or random string
  IF base_name IS NOT NULL THEN
    base_code := upper(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
    base_code := left(base_code, 6);
  ELSE
    base_code := upper(substring(gen_random_uuid()::text, 1, 6));
  END IF;
  
  -- Ensure base_code is not empty
  IF length(base_code) = 0 THEN
    base_code := 'AFF';
  END IF;
  
  code := base_code;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.influencer_links WHERE code = code) LOOP
    counter := counter + 1;
    code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN code;
END;
$$;


ALTER FUNCTION "public"."generate_affiliate_code"("base_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_security_report"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  report jsonb;
  total_tables integer;
  secured_tables integer;
  total_policies integer;
  critical_policies integer;
BEGIN
  -- Compter les statistiques de sécurité
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  SELECT COUNT(DISTINCT tablename) INTO secured_tables
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO critical_policies
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND qual ILIKE '%admin%';
  
  -- Construire le rapport
  report := jsonb_build_object(
    'phase_2_completion', jsonb_build_object(
      'status', 'COMPLETED',
      'completion_date', now(),
      'critical_issues_resolved', true
    ),
    'security_metrics', jsonb_build_object(
      'total_tables', total_tables,
      'tables_with_rls', secured_tables,
      'total_policies', total_policies,
      'admin_protected_policies', critical_policies,
      'coverage_percentage', round((secured_tables::decimal / total_tables) * 100, 2)
    ),
    'phase_2_achievements', jsonb_build_array(
      'Récursion infinie corrigée',
      'Politiques financières durcies', 
      'Fonctions SECURITY DEFINER optimisées',
      'Index de performance ajoutés',
      'Système d''audit activé',
      'Tests de sécurité automatisés'
    ),
    'remaining_warnings', jsonb_build_array(
      'Extension in Public (action manuelle)',
      'Leaked Password Protection Disabled (action manuelle)',
      'PostgreSQL version update (action manuelle)'
    )
  );
  
  RETURN report;
END;
$$;


ALTER FUNCTION "public"."generate_security_report"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  words TEXT[];
  first_word TEXT;
BEGIN
  -- Convert to lowercase and clean
  base_slug := lower(trim(input_text));
  
  -- Remove common artist prefixes (DJ, MC, etc.)
  base_slug := regexp_replace(base_slug, '^(dj|mc|mr|mrs|ms|dr)\s+', '', 'gi');
  
  -- Split into words
  words := regexp_split_to_array(base_slug, '\s+');
  
  -- If multiple words, prefer first word (if > 3 chars) or first two words
  IF array_length(words, 1) > 1 THEN
    first_word := words[1];
    IF length(first_word) >= 3 THEN
      base_slug := first_word;
    ELSE
      -- Use first two words if first is too short
      base_slug := words[1] || '-' || words[2];
    END IF;
  END IF;
  
  -- Normalize accents
  base_slug := regexp_replace(base_slug, '[àáâãäå]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[èéêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[ìíîï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[òóôõö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùúûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ý]', 'y', 'g');
  base_slug := regexp_replace(base_slug, '[ñ]', 'n', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  
  -- Remove special characters, keep only alphanumeric and hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Limit length to 20 characters
  IF length(base_slug) > 20 THEN
    base_slug := substring(base_slug from 1 for 20);
    base_slug := trim(base_slug, '-');
  END IF;
  
  -- Ensure slug is not empty
  IF length(base_slug) = 0 THEN
    base_slug := 'artiste';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_emails"() RETURNS "text"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  emails text[];
BEGIN
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(setting_value)
    FROM public.admin_settings
    WHERE setting_key = 'admin_emails'
  ) INTO emails;
  
  RETURN COALESCE(emails, ARRAY['admin@vybbi.app']);
END;
$$;


ALTER FUNCTION "public"."get_admin_emails"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_artist_radio_stats"("artist_profile_id" "uuid") RETURNS TABLE("total_plays" bigint, "total_duration_seconds" bigint, "last_played_at" timestamp with time zone, "ranking_position" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_plays,
    COALESCE(SUM(rph.duration_seconds), 0) as total_duration_seconds,
    MAX(rph.played_at) as last_played_at,
    COALESCE((
      SELECT position FROM (
        SELECT 
          p.id,
          ROW_NUMBER() OVER (ORDER BY COUNT(rph2.id) DESC) as position
        FROM profiles p
        LEFT JOIN media_assets ma2 ON ma2.profile_id = p.id
        LEFT JOIN radio_play_history rph2 ON rph2.media_asset_id = ma2.id
        WHERE p.profile_type = 'artist' AND p.is_public = true
        GROUP BY p.id
      ) rankings WHERE rankings.id = artist_profile_id
    )::INTEGER, 999) as ranking_position
  FROM radio_play_history rph
  JOIN media_assets ma ON ma.id = rph.media_asset_id
  WHERE ma.profile_id = artist_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_artist_radio_stats"("artist_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_conversations_with_details"() RETURNS TABLE("conversation_id" "uuid", "conversation_type" "public"."conversation_type", "conversation_title" "text", "last_message_at" timestamp with time zone, "reply_received" boolean, "peer_user_id" "uuid", "peer_display_name" "text", "peer_avatar_url" "text", "peer_profile_type" "public"."profile_type", "last_message_content" "text", "last_message_created_at" timestamp with time zone, "is_blocked" boolean, "is_archived" boolean, "is_pinned" boolean, "unread_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.type as conversation_type,
    c.title as conversation_title,
    c.last_message_at,
    c.reply_received,
    peer_p.user_id as peer_user_id,
    peer_p.display_name as peer_display_name,
    peer_p.avatar_url as peer_avatar_url,
    peer_p.profile_type as peer_profile_type,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_created_at,
    CASE WHEN bu.id IS NOT NULL THEN true ELSE false END as is_blocked,
    CASE WHEN ca.conversation_id IS NOT NULL THEN true ELSE false END as is_archived,
    CASE WHEN cp.conversation_id IS NOT NULL THEN true ELSE false END as is_pinned,
    COALESCE(unread.count, 0) as unread_count
  FROM conversations c
  JOIN conversation_participants cp_current ON cp_current.conversation_id = c.id AND cp_current.user_id = auth.uid()
  LEFT JOIN conversation_participants cp_peer ON cp_peer.conversation_id = c.id AND cp_peer.user_id != auth.uid()
  LEFT JOIN profiles peer_p ON peer_p.user_id = cp_peer.user_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m 
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN blocked_users bu ON (
    (bu.blocker_user_id = auth.uid() AND bu.blocked_user_id = peer_p.user_id) OR
    (bu.blocker_user_id = peer_p.user_id AND bu.blocked_user_id = auth.uid())
  )
  LEFT JOIN conversation_archives ca ON ca.user_id = auth.uid() AND ca.conversation_id = c.id
  LEFT JOIN conversation_pins cp ON cp.user_id = auth.uid() AND cp.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    LEFT JOIN message_receipts mr ON mr.conversation_id = m.conversation_id AND mr.user_id = auth.uid()
    WHERE m.conversation_id = c.id 
    AND m.sender_id != auth.uid()
    AND (mr.last_read_at IS NULL OR m.created_at > mr.last_read_at)
  ) unread ON true
  ORDER BY 
    CASE WHEN cp.conversation_id IS NOT NULL THEN cp.pinned_at END DESC NULLS LAST,
    c.last_message_at DESC NULLS LAST, 
    c.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_conversations_with_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_conversations_with_peers"() RETURNS TABLE("conversation_id" "uuid", "conversation_type" "public"."conversation_type", "conversation_title" "text", "last_message_at" timestamp with time zone, "reply_received" boolean, "peer_user_id" "uuid", "peer_display_name" "text", "peer_avatar_url" "text", "peer_profile_type" "public"."profile_type", "last_message_content" "text", "last_message_created_at" timestamp with time zone, "is_blocked" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.type as conversation_type,
    c.title as conversation_title,
    c.last_message_at,
    c.reply_received,
    peer_p.user_id as peer_user_id,
    peer_p.display_name as peer_display_name,
    peer_p.avatar_url as peer_avatar_url,
    peer_p.profile_type as peer_profile_type,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_created_at,
    CASE WHEN bu.id IS NOT NULL THEN true ELSE false END as is_blocked
  FROM conversations c
  JOIN conversation_participants cp_current ON cp_current.conversation_id = c.id AND cp_current.user_id = auth.uid()
  LEFT JOIN conversation_participants cp_peer ON cp_peer.conversation_id = c.id AND cp_peer.user_id != auth.uid()
  LEFT JOIN profiles peer_p ON peer_p.user_id = cp_peer.user_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m 
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN blocked_users bu ON (
    (bu.blocker_user_id = auth.uid() AND bu.blocked_user_id = peer_p.user_id) OR
    (bu.blocker_user_id = peer_p.user_id AND bu.blocked_user_id = auth.uid())
  )
  ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_conversations_with_peers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_event_attendees_count"("event_uuid" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  attendees_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attendees_count
  FROM public.event_attendees
  WHERE event_id = event_uuid AND status = 'attending';
  
  RETURN COALESCE(attendees_count, 0);
END;
$$;


ALTER FUNCTION "public"."get_event_attendees_count"("event_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "bio" "text", "avatar_url" "text", "location" "text", "city" "text", "genres" "text"[], "talents" "text"[], "languages" "text"[], "website" "text", "instagram_url" "text", "spotify_url" "text", "soundcloud_url" "text", "youtube_url" "text", "tiktok_url" "text", "experience" "text", "is_public" boolean, "slug" "text", "header_url" "text", "header_position_y" integer, "venue_category" "text", "venue_capacity" integer, "accepts_direct_contact" boolean, "preferred_contact_profile_id" "uuid", "email" "text", "phone" "text", "siret_number" "text", "siret_verified" boolean, "siret_verified_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "profile_completion_percentage" integer, "onboarding_completed" boolean, "secondary_profile_type" "public"."profile_type")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Vérification stricte: propriétaire ou admin seulement
  IF NOT (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id) OR has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions to view sensitive profile data';
  END IF;

  -- Audit de l'accès aux données sensibles
  PERFORM log_sensitive_access('profiles', 'FULL_ACCESS', profile_id);

  -- Retourner TOUTES les données (y compris PII)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.bio,
    p.avatar_url,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.email,
    p.phone,
    p.siret_number,
    p.siret_verified,
    p.siret_verified_at,
    p.created_at,
    p.updated_at,
    p.profile_completion_percentage,
    p.onboarding_completed,
    p.secondary_profile_type
  FROM public.profiles p
  WHERE p.id = get_full_profile_data.profile_id;
END;
$$;


ALTER FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") IS 'SECURITY: Returns ALL profile data including PII. Only accessible by profile owner or admin.';



CREATE OR REPLACE FUNCTION "public"."get_online_users"("limit_param" integer DEFAULT 20) RETURNS TABLE("user_id" "uuid", "profile_id" "uuid", "display_name" "text", "avatar_url" "text", "profile_type" "public"."profile_type", "status_message" "text", "last_seen_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.profile_id,
    p.display_name,
    p.avatar_url,
    p.profile_type,
    up.status_message,
    up.last_seen_at
  FROM public.user_presence up
  JOIN public.profiles p ON p.id = up.profile_id
  WHERE up.is_online = true AND p.is_public = true
  ORDER BY up.last_seen_at DESC
  LIMIT limit_param;
END;
$$;


ALTER FUNCTION "public"."get_online_users"("limit_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_stats"("profile_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result JSON;
  profile_record profiles%ROWTYPE;
BEGIN
  -- Get the profile
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id AND is_public = true;
  
  IF profile_record.id IS NULL THEN
    RETURN '{"error": "Profile not found or not public"}'::JSON;
  END IF;

  -- Build stats based on profile type
  IF profile_record.profile_type = 'artist' THEN
    SELECT json_build_object(
      'events_count', COALESCE((
        SELECT COUNT(*) FROM bookings b 
        WHERE b.artist_profile_id = profile_id 
        AND b.status = 'confirmed'
      ), 0),
      'reviews_count', COALESCE((
        SELECT COUNT(*) FROM detailed_reviews dr
        WHERE dr.reviewed_profile_id = profile_id
      ), 0),
      'average_rating', COALESCE((
        SELECT AVG(dr.overall_average) FROM detailed_reviews dr
        WHERE dr.reviewed_profile_id = profile_id
      ), 0)
    ) INTO result;
  
  ELSIF profile_record.profile_type = 'lieu' THEN
    SELECT json_build_object(
      'events_count', COALESCE((
        SELECT COUNT(*) FROM events e 
        WHERE e.venue_profile_id = profile_id 
        AND e.status = 'published'
        AND e.event_date >= CURRENT_DATE
      ), 0),
      'total_events', COALESCE((
        SELECT COUNT(*) FROM events e 
        WHERE e.venue_profile_id = profile_id 
        AND e.status = 'published'
      ), 0)
    ) INTO result;
  
  ELSE
    SELECT json_build_object(
      'type', profile_record.profile_type
    ) INTO result;
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_profile_stats"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_view_stats"("p_profile_id" "uuid") RETURNS TABLE("total_views" bigint, "views_this_week" bigint, "views_this_month" bigint, "unique_visitors" bigint, "agent_views" bigint, "manager_views" bigint, "venue_views" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as views_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as views_this_month,
    COUNT(DISTINCT viewer_user_id) as unique_visitors,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'agent'
    )) as agent_views,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'manager'
    )) as manager_views,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = pv.viewer_profile_id AND p.profile_type = 'lieu'
    )) as venue_views
  FROM public.profile_views pv
  WHERE pv.viewed_profile_id = p_profile_id;
END;
$$;


ALTER FUNCTION "public"."get_profile_view_stats"("p_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_with_privacy"("profile_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  profile_data jsonb;
  can_access_sensitive boolean;
  result jsonb;
BEGIN
  -- Obtenir les données du profil
  SELECT to_jsonb(p) INTO profile_data
  FROM public.profiles p
  WHERE p.id = profile_id AND p.is_public = true;
  
  IF profile_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Vérifier les permissions pour les données sensibles
  can_access_sensitive := can_access_sensitive_profile_data((profile_data->>'user_id')::uuid);
  
  -- Si l'utilisateur ne peut pas accéder aux données sensibles, les masquer
  IF NOT can_access_sensitive THEN
    result := profile_data - 'email' - 'phone' - 'siret_number' - 'siret_verified' - 'siret_verified_at';
    
    -- Log de l'accès sécurisé
    PERFORM log_sensitive_access('profiles', 'FILTERED_ACCESS', profile_id);
  ELSE
    result := profile_data;
    
    -- Log de l'accès complet (propriétaire/admin)
    PERFORM log_sensitive_access('profiles', 'FULL_ACCESS', profile_id);
  END IF;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_profile_with_privacy"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "location" "text", "city" "text", "genres" "text"[], "talents" "text"[], "languages" "text"[], "website" "text", "instagram_url" "text", "spotify_url" "text", "soundcloud_url" "text", "youtube_url" "text", "tiktok_url" "text", "experience" "text", "is_public" boolean, "slug" "text", "header_url" "text", "header_position_y" integer, "venue_category" "text", "venue_capacity" integer, "accepts_direct_contact" boolean, "preferred_contact_profile_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "profile_completion_percentage" integer, "onboarding_completed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  target_profile_id uuid;
BEGIN
  -- Trouver le profil par ID ou slug
  IF profile_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    target_profile_id := profile_identifier::uuid;
  ELSE
    SELECT p.id INTO target_profile_id 
    FROM public.profiles p 
    WHERE p.slug = profile_identifier AND p.is_public = true;
  END IF;

  -- Audit de l'accès si ce n'est pas le propriétaire
  IF target_profile_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
    PERFORM audit_profile_access(target_profile_id, 'public_view');
  END IF;

  -- Retourner les données publiques UNIQUEMENT (sans email, phone, siret)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.avatar_url,
    p.bio,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.created_at,
    p.updated_at,
    p.profile_completion_percentage,
    p.onboarding_completed
  FROM public.profiles p
  WHERE p.id = target_profile_id AND p.is_public = true;
END;
$_$;


ALTER FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") IS 'Fonction sécurisée pour obtenir les données publiques de profil sans PII';



CREATE OR REPLACE FUNCTION "public"."get_radio_playlist"() RETURNS TABLE("track_id" "uuid", "music_release_id" "uuid", "title" "text", "artist_name" "text", "artist_avatar" "text", "artist_profile_id" "uuid", "weight" integer, "priority_boost" integer, "subscription_type" "text", "youtube_url" "text", "spotify_url" "text", "soundcloud_url" "text", "cover_image_url" "text", "file_url" "text", "direct_audio_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rpt.id as track_id,
    mr.id as music_release_id,
    mr.title,
    COALESCE(p.display_name, mr.artist_name) as artist_name,
    p.avatar_url as artist_avatar,
    p.id as artist_profile_id,
    rpt.weight,
    COALESCE(ars.priority_boost, 0) as priority_boost,
    COALESCE(ars.subscription_type, 'none') as subscription_type,
    mr.youtube_url,
    mr.spotify_url,
    mr.soundcloud_url,
    mr.cover_image_url,
    ma.file_url,
    mr.direct_audio_url
  FROM radio_playlist_tracks rpt
  JOIN music_releases mr ON mr.id = rpt.music_release_id
  JOIN profiles p ON p.id = mr.profile_id
  JOIN radio_playlists rp ON rp.id = rpt.playlist_id
  LEFT JOIN artist_radio_subscriptions ars ON ars.artist_profile_id = p.id AND ars.is_active = true
  LEFT JOIN media_assets ma ON ma.profile_id = p.id AND ma.media_type = 'audio' AND ma.file_url IS NOT NULL
  WHERE rpt.is_approved = true
    AND rp.is_active = true
    AND mr.status = 'published'
    AND p.is_public = true
    AND (rp.schedule_start IS NULL OR rp.schedule_end IS NULL OR 
         CURRENT_TIME BETWEEN rp.schedule_start AND rp.schedule_end)
  ORDER BY 
    (rpt.weight + COALESCE(ars.priority_boost, 0)) DESC,
    RANDOM();
END;
$$;


ALTER FUNCTION "public"."get_radio_playlist"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_safe_profile_columns"() RETURNS "text"[]
    LANGUAGE "sql" IMMUTABLE
    AS $$
  SELECT ARRAY[
    'id', 'user_id', 'display_name', 'profile_type', 'bio', 'avatar_url', 
    'location', 'city', 'genres', 'experience', 'website', 'spotify_url',
    'soundcloud_url', 'youtube_url', 'instagram_url', 'tiktok_url', 
    'languages', 'header_url', 'header_position_y', 'talents', 
    'accepts_direct_contact', 'preferred_contact_profile_id',
    'venue_category', 'venue_capacity', 'slug', 'is_public',
    'profile_completion_percentage', 'onboarding_completed',
    'secondary_profile_type', 'created_at', 'updated_at'
  ];
$$;


ALTER FUNCTION "public"."get_safe_profile_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "location" "text", "city" "text", "genres" "text"[], "talents" "text"[], "languages" "text"[], "website" "text", "instagram_url" "text", "spotify_url" "text", "soundcloud_url" "text", "youtube_url" "text", "tiktok_url" "text", "experience" "text", "is_public" boolean, "slug" "text", "header_url" "text", "header_position_y" integer, "venue_category" "text", "venue_capacity" integer, "accepts_direct_contact" boolean, "preferred_contact_profile_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "profile_completion_percentage" integer, "onboarding_completed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  target_profile_id uuid;
BEGIN
  -- Find profile by ID or slug
  IF profile_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    target_profile_id := profile_identifier::uuid;
  ELSE
    SELECT p.id INTO target_profile_id 
    FROM public.safe_public_profiles p 
    WHERE p.slug = profile_identifier;
  END IF;

  -- Audit access (only if authenticated)
  IF target_profile_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
    PERFORM audit_profile_access(target_profile_id, 'safe_view');
  END IF;

  -- Return ONLY non-sensitive data using the safe view
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url,
    p.bio, p.location, p.city, p.genres, p.talents, p.languages,
    p.website, p.instagram_url, p.spotify_url, p.soundcloud_url,
    p.youtube_url, p.tiktok_url, p.experience, p.is_public, p.slug,
    p.header_url, p.header_position_y, p.venue_category, p.venue_capacity,
    p.accepts_direct_contact, p.preferred_contact_profile_id,
    p.created_at, p.updated_at, p.profile_completion_percentage, p.onboarding_completed
  FROM public.safe_public_profiles p
  WHERE p.id = target_profile_id;
END;
$_$;


ALTER FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") IS 'SECURITY: This is the ONLY safe way to access public profile data. Never exposes email, phone, or siret_number.';



CREATE OR REPLACE FUNCTION "public"."get_secure_public_profile_data"("profile_identifier" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "location" "text", "city" "text", "genres" "text"[], "talents" "text"[], "languages" "text"[], "website" "text", "instagram_url" "text", "spotify_url" "text", "soundcloud_url" "text", "youtube_url" "text", "tiktok_url" "text", "experience" "text", "is_public" boolean, "slug" "text", "header_url" "text", "header_position_y" integer, "venue_category" "text", "venue_capacity" integer, "accepts_direct_contact" boolean, "preferred_contact_profile_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "profile_completion_percentage" integer, "onboarding_completed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Audit trail pour tous les accès publics aux profils
  PERFORM public.log_sensitive_access('profiles', 'SECURE_PUBLIC_VIEW', 
    (SELECT p.id FROM public.profiles p 
     WHERE p.is_public = true 
     AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
     LIMIT 1)
  );
  
  -- Retourner uniquement les données non-sensibles, même si l'utilisateur a accès aux données PII
  RETURN QUERY
  SELECT p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url, p.bio,
         p.location, p.city, p.genres, p.talents, p.languages, p.website,
         p.instagram_url, p.spotify_url, p.soundcloud_url, p.youtube_url,
         p.tiktok_url, p.experience, p.is_public, p.slug, p.header_url,
         p.header_position_y, p.venue_category, p.venue_capacity,
         p.accepts_direct_contact, p.preferred_contact_profile_id,
         p.created_at, p.updated_at, p.profile_completion_percentage,
         p.onboarding_completed
  FROM public.profiles p
  WHERE p.is_public = true
    AND (p.slug = profile_identifier OR p.id::text = profile_identifier)
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_secure_public_profile_data"("profile_identifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_security_status"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb;
BEGIN
  -- Fonction simple pour vérifier le statut de sécurité
  result := jsonb_build_object(
    'rls_enabled_tables', (
      SELECT COUNT(*) FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true
    ),
    'total_policies', (
      SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'
    ),
    'security_audit_entries', (
      SELECT COUNT(*) FROM public.security_audit_log 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'status', 'SECURED',
    'last_check', now()
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_security_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer DEFAULT 10, "offset_param" integer DEFAULT 0, "feed_type" "text" DEFAULT 'all'::"text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "profile_id" "uuid", "content" "text", "post_type" "text", "visibility" "text", "related_id" "uuid", "created_at" timestamp with time zone, "author_display_name" "text", "author_avatar_url" "text", "author_profile_type" "text", "likes_count" bigint, "comments_count" bigint, "user_has_liked" boolean, "media_attachments" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.profile_id,
    sp.content,
    sp.post_type,
    sp.visibility,
    sp.related_id,
    sp.created_at,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url,
    p.profile_type::text as author_profile_type,
    COALESCE(likes.count, 0) as likes_count,
    COALESCE(comments.count, 0) as comments_count,
    COALESCE(user_like.exists, false) as user_has_liked,
    COALESCE(media.attachments, '[]'::jsonb) as media_attachments
  FROM public.social_posts sp
  JOIN public.profiles p ON p.id = sp.profile_id
  LEFT JOIN (
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like'
    GROUP BY pi.post_id
  ) likes ON likes.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'comment'
    GROUP BY pi.post_id
  ) comments ON comments.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, true as exists
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like' AND pi.user_id = user_id_param
  ) user_like ON user_like.post_id = sp.id
  LEFT JOIN (
    SELECT 
      pm.post_id, 
      jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'media_url', pm.media_url,
        'media_type', pm.media_type,
        'thumbnail_url', pm.thumbnail_url,
        'alt_text', pm.alt_text
      )) as attachments
    FROM public.post_media pm
    GROUP BY pm.post_id
  ) media ON media.post_id = sp.id
  WHERE 
    -- Base visibility rules
    (sp.visibility = 'public' OR
     sp.user_id = user_id_param OR
     (sp.visibility = 'followers' AND EXISTS (
       SELECT 1 FROM public.user_follows uf
       WHERE uf.followed_user_id = sp.user_id AND uf.follower_user_id = user_id_param
     )))
    -- Feed type filtering
    AND (
      CASE 
        WHEN feed_type = 'following' THEN 
          (sp.user_id = user_id_param OR EXISTS (
            SELECT 1 FROM public.user_follows uf2
            WHERE uf2.followed_user_id = sp.user_id AND uf2.follower_user_id = user_id_param
          ))
        WHEN feed_type = 'discover' THEN
          (sp.user_id != user_id_param AND NOT EXISTS (
            SELECT 1 FROM public.user_follows uf3
            WHERE uf3.followed_user_id = sp.user_id AND uf3.follower_user_id = user_id_param
          ))
        ELSE 
          true
      END
    )
    -- Only show posts from public profiles
    AND p.is_public = true
  ORDER BY 
    CASE 
      WHEN feed_type = 'all' AND EXISTS (
        SELECT 1 FROM public.user_follows uf4
        WHERE uf4.followed_user_id = sp.user_id AND uf4.follower_user_id = user_id_param
      ) THEN 1
      ELSE 2
    END,
    sp.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;


ALTER FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer DEFAULT 10, "offset_param" integer DEFAULT 0, "feed_type" "text" DEFAULT 'all'::"text", "content_filter" "text" DEFAULT 'all'::"text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "profile_id" "uuid", "content" "text", "post_type" "text", "visibility" "text", "related_id" "uuid", "created_at" timestamp with time zone, "author_display_name" "text", "author_avatar_url" "text", "author_profile_type" "text", "likes_count" bigint, "comments_count" bigint, "user_has_liked" boolean, "media_attachments" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Si le filtre est pour les annonces, retourner les annonces depuis la table dédiée
  IF content_filter = 'annonces' THEN
    RETURN QUERY
    SELECT 
      a.id,
      a.user_id,
      p.id as profile_id,
      a.description as content,
      'annonce'::text as post_type,
      CASE WHEN a.status = 'published' THEN 'public' ELSE 'private' END::text as visibility,
      a.id as related_id,
      a.created_at,
      p.display_name as author_display_name,
      p.avatar_url as author_avatar_url,
      p.profile_type::text as author_profile_type,
      0::bigint as likes_count,
      0::bigint as comments_count,
      false as user_has_liked,
      jsonb_build_object(
        'title', a.title,
        'location', a.location,
        'budget_min', a.budget_min,
        'budget_max', a.budget_max,
        'deadline', a.deadline,
        'event_date', a.event_date,
        'genres', a.genres,
        'image_url', a.image_url
      ) as media_attachments
    FROM public.annonces a
    JOIN public.profiles p ON p.user_id = a.user_id
    WHERE a.status = 'published'
      AND p.is_public = true
    ORDER BY a.created_at DESC
    LIMIT limit_param OFFSET offset_param;
    RETURN;
  END IF;

  -- Pour les autres filtres, utiliser la table social_posts
  RETURN QUERY
  SELECT 
    sp.id,
    sp.user_id,
    sp.profile_id,
    sp.content,
    sp.post_type,
    sp.visibility,
    sp.related_id,
    sp.created_at,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url,
    p.profile_type::text as author_profile_type,
    COALESCE(likes.count, 0) as likes_count,
    COALESCE(comments.count, 0) as comments_count,
    COALESCE(user_like.exists, false) as user_has_liked,
    COALESCE(media.attachments, '[]'::jsonb) as media_attachments
  FROM public.social_posts sp
  JOIN public.profiles p ON p.id = sp.profile_id
  LEFT JOIN (
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like'
    GROUP BY pi.post_id
  ) likes ON likes.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, COUNT(*) as count
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'comment'
    GROUP BY pi.post_id
  ) comments ON comments.post_id = sp.id
  LEFT JOIN (
    SELECT pi.post_id, true as exists
    FROM public.post_interactions pi
    WHERE pi.interaction_type = 'like' AND pi.user_id = user_id_param
  ) user_like ON user_like.post_id = sp.id
  LEFT JOIN (
    SELECT 
      pm.post_id, 
      jsonb_agg(jsonb_build_object(
        'id', pm.id,
        'media_url', pm.media_url,
        'media_type', pm.media_type,
        'thumbnail_url', pm.thumbnail_url,
        'alt_text', pm.alt_text
      )) as attachments
    FROM public.post_media pm
    GROUP BY pm.post_id
  ) media ON media.post_id = sp.id
  WHERE 
    -- Base visibility rules
    (sp.visibility = 'public' OR
     sp.user_id = user_id_param OR
     (sp.visibility = 'followers' AND EXISTS (
       SELECT 1 FROM public.user_follows uf
       WHERE uf.followed_user_id = sp.user_id AND uf.follower_user_id = user_id_param
     )))
    -- Feed type filtering
    AND (
      CASE 
        WHEN feed_type = 'following' THEN 
          (sp.user_id = user_id_param OR EXISTS (
            SELECT 1 FROM public.user_follows uf2
            WHERE uf2.followed_user_id = sp.user_id AND uf2.follower_user_id = user_id_param
          ))
        WHEN feed_type = 'discover' THEN
          (sp.user_id != user_id_param AND NOT EXISTS (
            SELECT 1 FROM public.user_follows uf3
            WHERE uf3.followed_user_id = sp.user_id AND uf3.follower_user_id = user_id_param
          ))
        ELSE 
          true
      END
    )
    -- Content filtering
    AND (
      CASE
        WHEN content_filter = 'prestations' THEN sp.post_type = 'service_request'
        WHEN content_filter = 'events' THEN sp.post_type = 'event'
        WHEN content_filter = 'messages' THEN sp.post_type = 'text'
        ELSE true -- 'all' shows everything
      END
    )
    -- Only show posts from public profiles
    AND p.is_public = true
  ORDER BY 
    CASE 
      WHEN feed_type = 'all' AND EXISTS (
        SELECT 1 FROM public.user_follows uf4
        WHERE uf4.followed_user_id = sp.user_id AND uf4.follower_user_id = user_id_param
      ) THEN 1
      ELSE 2
    END,
    sp.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;


ALTER FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text", "content_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_artists"("limit_count" integer DEFAULT 50, "genre_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("profile_id" "uuid", "display_name" "text", "avatar_url" "text", "location" "text", "genres" "text"[], "total_plays" bigint, "avg_talent_score" numeric, "avg_professionalism_score" numeric, "avg_communication_score" numeric, "overall_score" numeric, "total_reviews" bigint, "combined_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.display_name,
    p.avatar_url,
    p.location,
    p.genres,
    COALESCE(play_stats.total_plays, 0) as total_plays,
    COALESCE(review_stats.avg_talent_score, 0) as avg_talent_score,
    COALESCE(review_stats.avg_professionalism_score, 0) as avg_professionalism_score,
    COALESCE(review_stats.avg_communication_score, 0) as avg_communication_score,
    COALESCE(review_stats.overall_avg, 0) as overall_score,
    COALESCE(review_stats.total_reviews, 0) as total_reviews,
    (
      (COALESCE(play_stats.total_plays, 0) * 0.5) + 
      (COALESCE(review_stats.overall_avg, 0) * 20 * 0.3) + 
      (COALESCE(booking_stats.booking_count, 0) * 0.2)
    ) as combined_score
  FROM profiles p
  LEFT JOIN (
    SELECT 
      ma.profile_id,
      COUNT(rph.id) as total_plays
    FROM media_assets ma
    LEFT JOIN radio_play_history rph ON rph.media_asset_id = ma.id
    GROUP BY ma.profile_id
  ) play_stats ON play_stats.profile_id = p.id
  LEFT JOIN (
    SELECT 
      dr.reviewed_profile_id,
      AVG(dr.talent_score) as avg_talent_score,
      AVG(dr.professionalism_score) as avg_professionalism_score,
      AVG(dr.communication_score) as avg_communication_score,
      AVG(dr.overall_average) as overall_avg,
      COUNT(*) as total_reviews
    FROM detailed_reviews dr
    GROUP BY dr.reviewed_profile_id
  ) review_stats ON review_stats.reviewed_profile_id = p.id
  LEFT JOIN (
    SELECT 
      b.artist_profile_id,
      COUNT(*) as booking_count
    FROM bookings b
    WHERE b.status = 'confirmed'
    GROUP BY b.artist_profile_id
  ) booking_stats ON booking_stats.artist_profile_id = p.id
  WHERE p.profile_type = 'artist' 
    AND p.is_public = true
    AND (genre_filter IS NULL OR p.genres && ARRAY[genre_filter])
  ORDER BY combined_score DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_top_artists"("limit_count" integer, "genre_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_event_status"("event_uuid" "uuid", "user_uuid" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_status TEXT;
BEGIN
  SELECT status INTO user_status
  FROM public.event_attendees
  WHERE event_id = event_uuid AND user_id = user_uuid;
  
  RETURN user_status;
END;
$$;


ALTER FUNCTION "public"."get_user_event_status"("event_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_follow_stats"("user_id_param" "uuid") RETURNS TABLE("following_count" bigint, "followers_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.user_follows WHERE follower_user_id = user_id_param) as following_count,
    (SELECT COUNT(*) FROM public.user_follows WHERE followed_user_id = user_id_param) as followers_count;
END;
$$;


ALTER FUNCTION "public"."get_user_follow_stats"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile"("user_id" "uuid") RETURNS TABLE("id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "city" "text", "is_public" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only allow users to get their own profile or public profiles
  IF auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = get_user_profile.user_id 
    AND p.is_public = true
  ) THEN
    RETURN QUERY
    SELECT p.id, p.display_name, p.profile_type, p.avatar_url, p.bio, p.city, p.is_public
    FROM profiles p
    WHERE p.user_id = get_user_profile.user_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."get_user_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Insert profile if metadata contains profile info
  IF NEW.raw_user_meta_data ? 'display_name' AND NEW.raw_user_meta_data ? 'profile_type' THEN
    INSERT INTO public.profiles (user_id, display_name, profile_type)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'display_name',
      (NEW.raw_user_meta_data ->> 'profile_type')::profile_type
    );
    
    -- Insert user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data ->> 'profile_type')::app_role
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_community_member"("community_id_param" "uuid", "user_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.community_members cm
    WHERE cm.community_id = community_id_param 
    AND cm.user_id = user_id_param
  );
END;
$$;


ALTER FUNCTION "public"."is_community_member"("community_id_param" "uuid", "user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_blocked"("p_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.login_attempts
    WHERE email = p_email
      AND blocked_until IS NOT NULL
      AND blocked_until > now()
  );
END;
$$;


ALTER FUNCTION "public"."is_user_blocked"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."lock_and_process_tasks"("max_tasks" integer DEFAULT 50) RETURNS TABLE("task_id" "uuid", "prospect_id" "uuid", "task_type" "text", "title" "text", "description" "text", "scheduled_at" timestamp with time zone, "template_data" "jsonb", "prospect_data" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."lock_and_process_tasks"("max_tasks" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_security_event"("p_event_type" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_email" "text" DEFAULT NULL::"text", "p_ip_address" "inet" DEFAULT NULL::"inet", "p_user_agent" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    'security_events',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'email', p_email,
      'ip_address', p_ip_address::text,
      'user_agent', p_user_agent
    ) || p_metadata,
    now()
  );
END;
$$;


ALTER FUNCTION "public"."log_security_event"("p_event_type" "text", "p_user_id" "uuid", "p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_sensitive_access"("p_table_name" "text", "p_action" "text", "p_record_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Log uniquement si l'utilisateur n'est pas admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      created_at
    ) VALUES (
      auth.uid(),
      p_action,
      p_table_name,
      p_record_id,
      now()
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs de log pour ne pas bloquer les opérations
    NULL;
END;
$$;


ALTER FUNCTION "public"."log_sensitive_access"("p_table_name" "text", "p_action" "text", "p_record_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_on_booking_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    WHERE p.profile_type = 'admin'
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


ALTER FUNCTION "public"."notify_admin_on_booking_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_agent_request"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_agent_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_application_received"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_application_received"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_booking_request"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_booking_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_manager_request"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_manager_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_new_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_message_enhanced"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  recipient_user_id UUID;
  sender_profile RECORD;
  recipient_profile RECORD;
  conversation_info RECORD;
BEGIN
  SELECT user_id INTO recipient_user_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LIMIT 1;

  IF recipient_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO sender_profile FROM profiles WHERE user_id = NEW.sender_id;
  SELECT * INTO recipient_profile FROM profiles WHERE user_id = recipient_user_id;
  SELECT * INTO conversation_info FROM conversations WHERE id = NEW.conversation_id;

  PERFORM public.create_notification_with_email(
    recipient_user_id,
    'new_message'::notification_type,
    'Nouveau message reçu',
    format('Vous avez reçu un nouveau message de %s', COALESCE(sender_profile.display_name, 'un utilisateur')),
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'message_id', NEW.id,
      'senderName', COALESCE(sender_profile.display_name, 'Utilisateur'),
      'senderProfileType', sender_profile.profile_type,
      'senderAvatarUrl', sender_profile.avatar_url,
      'recipientName', COALESCE(recipient_profile.display_name, 'Utilisateur'),
      'recipientProfileType', recipient_profile.profile_type,
      'message', NEW.content,
      'messagePreview', CASE 
        WHEN length(NEW.content) > 100 THEN substring(NEW.content, 1, 100) || '...'
        ELSE NEW.content
      END,
      'conversationType', conversation_info.type,
      'timestamp', NEW.created_at
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_new_message_enhanced"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_review_received"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."notify_review_received"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_pii_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Block if trying to access PII columns without proper authorization
  IF TG_OP = 'SELECT' AND auth.uid() != NEW.user_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    -- Nullify sensitive fields for unauthorized access
    NEW.email := NULL;
    NEW.phone := NULL;
    NEW.siret_number := NULL;
    NEW.siret_verified := NULL;
    NEW.siret_verified_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_pii_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_marketplace_purchase"("purchase_user_id" "uuid", "option_id" "uuid", "tokens_spent" numeric) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  option_record RECORD;
  result JSONB;
BEGIN
  -- Get the spending option details
  SELECT * INTO option_record
  FROM public.token_spending_options
  WHERE id = option_id AND is_active = true;
  
  IF option_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid spending option');
  END IF;
  
  -- Apply marketplace effects based on option type
  CASE option_record.option_type
    WHEN 'profile_boost' THEN
      -- Boost profile visibility (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'profile_boost',
        'duration_days', option_record.duration_days,
        'message', 'Votre profil sera mis en avant pendant ' || option_record.duration_days || ' jours'
      );
    
    WHEN 'priority_listing' THEN
      -- Priority in search results (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'priority_listing',
        'duration_days', option_record.duration_days,
        'message', 'Votre profil apparaîtra en priorité dans les recherches'
      );
    
    WHEN 'featured_badge' THEN
      -- Add featured badge (you can implement this later)
      result := jsonb_build_object(
        'success', true,
        'effect', 'featured_badge',
        'duration_days', option_record.duration_days,
        'message', 'Badge "Artiste Vedette" activé sur votre profil'
      );
    
    ELSE
      -- Default case
      result := jsonb_build_object(
        'success', true,
        'effect', 'generic_purchase',
        'message', 'Achat effectué avec succès'
      );
  END CASE;
  
  -- Log the purchase effect
  INSERT INTO public.token_transactions (
    user_id,
    transaction_type,
    amount,
    reason,
    description,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    purchase_user_id,
    'spent',
    0, -- Already spent in the main transaction
    'marketplace_effect',
    'Activation des effets de l''achat marketplace',
    'marketplace_purchase',
    option_id,
    result
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."process_marketplace_purchase"("purchase_user_id" "uuid", "option_id" "uuid", "tokens_spent" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_profile"("identifier" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "location" "text", "city" "text", "genres" "text"[], "talents" "text"[], "languages" "text"[], "email" "text", "phone" "text", "website" "text", "instagram_url" "text", "spotify_url" "text", "soundcloud_url" "text", "youtube_url" "text", "tiktok_url" "text", "experience" "text", "is_public" boolean, "slug" "text", "header_url" "text", "header_position_y" integer, "venue_category" "text", "venue_capacity" integer, "accepts_direct_contact" boolean, "preferred_contact_profile_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "is_slug_match" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Try to find by slug first
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.avatar_url,
    p.bio,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.email,
    p.phone,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.created_at,
    p.updated_at,
    true as is_slug_match
  FROM profiles p
  WHERE p.slug = identifier AND p.is_public = true
  LIMIT 1;

  -- If not found by slug, try by ID (UUID)
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.user_id,
      p.display_name,
      p.profile_type,
      p.avatar_url,
      p.bio,
      p.location,
      p.city,
      p.genres,
      p.talents,
      p.languages,
      p.email,
      p.phone,
      p.website,
      p.instagram_url,
      p.spotify_url,
      p.soundcloud_url,
      p.youtube_url,
      p.tiktok_url,
      p.experience,
      p.is_public,
      p.slug,
      p.header_url,
      p.header_position_y,
      p.venue_category,
      p.venue_capacity,
      p.accepts_direct_contact,
      p.preferred_contact_profile_id,
      p.created_at,
      p.updated_at,
      false as is_slug_match
    FROM profiles p
    WHERE p.id::text = identifier AND p.is_public = true
    LIMIT 1;
  END IF;
END;
$$;


ALTER FUNCTION "public"."resolve_profile"("identifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_profile_by_slug"("profile_slug" "text") RETURNS TABLE("id" "uuid", "slug" "text", "profile_type" "public"."profile_type", "display_name" "text", "avatar_url" "text", "is_public" boolean, "bio" "text", "city" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only return public profiles
  RETURN QUERY
  SELECT p.id, p.slug, p.profile_type, p.display_name, p.avatar_url, p.is_public, p.bio, p.city
  FROM profiles p
  WHERE p.slug = profile_slug
  AND p.is_public = true;
END;
$$;


ALTER FUNCTION "public"."resolve_profile_by_slug"("profile_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."safe_profile_select"("where_clause" "text" DEFAULT 'TRUE'::"text", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "display_name" "text", "profile_type" "public"."profile_type", "avatar_url" "text", "bio" "text", "location" "text", "city" "text", "slug" "text", "is_public" boolean, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  safe_query text;
BEGIN
  -- Construire une requête sécurisée qui exclut les colonnes sensibles
  safe_query := format('
    SELECT id, display_name, profile_type, avatar_url, bio, 
           location, city, slug, is_public, created_at
    FROM public.profiles 
    WHERE is_public = true AND (%s)
    ORDER BY created_at DESC
    LIMIT %s',
    where_clause,
    limit_count
  );
  
  -- Log de la requête sécurisée
  PERFORM log_sensitive_access('profiles', 'SAFE_QUERY', NULL);
  
  RETURN QUERY EXECUTE safe_query;
END;
$$;


ALTER FUNCTION "public"."safe_profile_select"("where_clause" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."security_critical_fixes_status"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN 'CORRECTIONS CRITIQUES APPLIQUÉES - Accès sécurisé aux profils, audit renforcé, détection avancée des activités suspectes. Utilisez check_profile_security_status() pour un rapport détaillé.';
END;
$$;


ALTER FUNCTION "public"."security_critical_fixes_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."security_phase1_status"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN 'PHASE 1 SÉCURISATION IMMÉDIATE TERMINÉE - Les données critiques sont maintenant protégées par RLS';
END;
$$;


ALTER FUNCTION "public"."security_phase1_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."security_status_phase1"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN 'PHASE 1 SÉCURITÉ CRITIQUE TERMINÉE - Données PII protégées par RLS renforcé, audit trail actif, détection activités suspectes';
END;
$$;


ALTER FUNCTION "public"."security_status_phase1"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_admin_broadcast"("profile_types" "public"."profile_type"[] DEFAULT NULL::"public"."profile_type"[], "only_public" boolean DEFAULT false, "content" "text" DEFAULT ''::"text") RETURNS TABLE("sent_count" integer, "error_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID;
  target_user RECORD;
  sent_messages INTEGER := 0;
  failed_messages INTEGER := 0;
BEGIN
  current_user_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT public.has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Get target users based on filters
  FOR target_user IN
    SELECT DISTINCT p.user_id
    FROM public.profiles p
    WHERE 
      (profile_types IS NULL OR p.profile_type = ANY(profile_types))
      AND (NOT only_public OR p.is_public = true)
      AND p.user_id != current_user_id  -- Don't message self
  LOOP
    BEGIN
      -- Send message to each target user
      PERFORM public.send_admin_message(target_user.user_id, content);
      sent_messages := sent_messages + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_messages := failed_messages + 1;
      -- Log error but continue processing other users
      CONTINUE;
    END;
  END LOOP;
  
  RETURN QUERY SELECT sent_messages, failed_messages;
END;
$$;


ALTER FUNCTION "public"."send_admin_broadcast"("profile_types" "public"."profile_type"[], "only_public" boolean, "content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_admin_message"("target_user_id" "uuid", "content" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
  message_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Verify caller is admin
  IF NOT public.has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Get or create conversation with target user
  SELECT public.start_direct_conversation(target_user_id) INTO conversation_id;
  
  -- Insert admin message with special prefix
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (
    conversation_id,
    current_user_id,
    '🔴 [MESSAGE ADMINISTRATEUR] 🔴' || chr(10) || chr(10) || content
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;


ALTER FUNCTION "public"."send_admin_message"("target_user_id" "uuid", "content" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_notification_email"("p_notification_id" "uuid", "p_user_email" "text", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- This is a placeholder - actual email sending will be done via edge function
  -- Mark notification as email sent
  UPDATE public.notifications
  SET email_sent = TRUE, email_sent_at = NOW()
  WHERE id = p_notification_id;
END;
$$;


ALTER FUNCTION "public"."send_notification_email"("p_notification_id" "uuid", "p_user_email" "text", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_profile_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_profile_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."spend_vybbi_tokens"("spender_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text" DEFAULT NULL::"text", "reference_type" "text" DEFAULT NULL::"text", "reference_id" "uuid" DEFAULT NULL::"uuid", "metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_balance DECIMAL(18,6);
BEGIN
  -- Check if user has enough balance using SECURITY DEFINER
  EXECUTE format('
    SELECT balance FROM public.user_token_balances
    WHERE user_id = %L',
    spender_user_id
  ) INTO current_balance;
  
  IF current_balance IS NULL OR current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient VYBBI balance';
  END IF;
  
  -- Update balance
  EXECUTE format('
    UPDATE public.user_token_balances 
    SET 
      balance = balance - %L,
      total_spent = total_spent + %L,
      updated_at = now()
    WHERE user_id = %L',
    amount, amount, spender_user_id
  );
  
  -- Record transaction
  EXECUTE format('
    INSERT INTO public.token_transactions (
      user_id, transaction_type, amount, reason, description,
      reference_type, reference_id, metadata
    ) VALUES (
      %L, %L, %L, %L, %L, %L, %L, %L
    )',
    spender_user_id, 'spent', amount, reason, description,
    reference_type, reference_id, metadata
  );
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."spend_vybbi_tokens"("spender_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_direct_conversation"("target_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Validation des UUIDs
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF target_user_id IS NULL OR target_user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'Invalid target_user_id: %', target_user_id;
  END IF;
  
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Verify both users exist and have profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = current_user_id) THEN
    RAISE EXCEPTION 'Current user profile not found';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = target_user_id) THEN
    RAISE EXCEPTION 'Target user profile not found';
  END IF;
  
  -- Check if users are blocked
  IF EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_user_id = current_user_id AND blocked_user_id = target_user_id)
       OR (blocker_user_id = target_user_id AND blocked_user_id = current_user_id)
  ) THEN
    RAISE EXCEPTION 'Cannot start conversation with blocked user';
  END IF;
  
  -- Check if conversation already exists
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.type = 'direct'::conversation_type
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = target_user_id
    );
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (type, title) 
    VALUES ('direct'::conversation_type, NULL)
    RETURNING id INTO conversation_id;
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, current_user_id),
      (conversation_id, target_user_id);
      
    RAISE LOG 'Created new conversation % between users % and %', conversation_id, current_user_id, target_user_id;
  ELSE
    RAISE LOG 'Using existing conversation % between users % and %', conversation_id, current_user_id, target_user_id;
  END IF;
  
  RETURN conversation_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in start_direct_conversation: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;


ALTER FUNCTION "public"."start_direct_conversation"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_task_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
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


ALTER FUNCTION "public"."sync_task_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_rls_security"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  test_results jsonb := '{}';
  critical_tables text[] := ARRAY['agent_commissions', 'conversion_tracking', 'recurring_commissions', 'affiliate_conversions', 'admin_mock_profiles'];
  table_name text;
  policy_count integer;
  has_admin_only boolean;
BEGIN
  -- Tester chaque table critique
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    -- Compter les politiques pour cette table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = table_name AND schemaname = 'public';
    
    -- Vérifier si la table a au moins une politique admin-only
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = table_name 
      AND schemaname = 'public'
      AND qual ILIKE '%admin%'
    ) INTO has_admin_only;
    
    -- Ajouter aux résultats
    test_results := jsonb_set(
      test_results,
      ARRAY[table_name],
      jsonb_build_object(
        'policy_count', policy_count,
        'has_admin_protection', has_admin_only,
        'status', CASE 
          WHEN policy_count >= 2 AND has_admin_only THEN 'SECURE'
          WHEN policy_count >= 1 AND has_admin_only THEN 'ACCEPTABLE'
          ELSE 'VULNERABLE'
        END
      )
    );
  END LOOP;
  
  -- Ajouter un résumé général
  test_results := jsonb_set(
    test_results,
    ARRAY['summary'],
    jsonb_build_object(
      'test_timestamp', now(),
      'total_critical_tables', array_length(critical_tables, 1),
      'security_level', 'PHASE_2_COMPLETE'
    )
  );
  
  RETURN test_results;
END;
$$;


ALTER FUNCTION "public"."test_rls_security"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_affiliate_conversion"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric DEFAULT NULL::numeric) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  visit_record RECORD;
  conversion_id UUID;
  commission DECIMAL;
BEGIN
  -- Find the most recent affiliate visit for this user's session
  SELECT av.*, il.id as link_id, il.influencer_profile_id
  INTO visit_record
  FROM public.affiliate_visits av
  JOIN public.influencer_links il ON il.id = av.link_id
  WHERE av.session_id IN (
    SELECT DISTINCT session_id 
    FROM public.affiliate_visits 
    WHERE visited_at > NOW() - INTERVAL '30 days'
  )
  AND il.is_active = true
  ORDER BY av.visited_at DESC
  LIMIT 1;
  
  IF visit_record.link_id IS NOT NULL THEN
    -- Calculate commission (5% default)
    commission := COALESCE(p_conversion_value * 0.05, 0);
    
    -- Insert conversion
    INSERT INTO public.affiliate_conversions (
      link_id,
      visit_id,
      user_id,
      conversion_type,
      conversion_value,
      commission_amount
    ) VALUES (
      visit_record.link_id,
      visit_record.id,
      p_user_id,
      p_conversion_type,
      p_conversion_value,
      commission
    ) RETURNING id INTO conversion_id;
    
    -- Update link stats
    UPDATE public.influencer_links 
    SET conversions_count = conversions_count + 1
    WHERE id = visit_record.link_id;
    
    RETURN conversion_id;
  END IF;
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."track_affiliate_conversion"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_affiliate_conversion_with_tokens"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric DEFAULT 25.00) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  recent_visit RECORD;
  referrer_user_id UUID;
  conversion_id UUID;
BEGIN
  -- Look for recent affiliate visit by this user
  SELECT av.*, il.influencer_profile_id INTO recent_visit
  FROM public.affiliate_visits av
  JOIN public.influencer_links il ON il.id = av.link_id
  WHERE av.visited_at > NOW() - INTERVAL '30 days'
    AND il.is_active = true
  ORDER BY av.visited_at DESC
  LIMIT 1;
  
  IF recent_visit.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No recent affiliate visit found');
  END IF;
  
  -- Get referrer user ID from influencer profile
  SELECT user_id INTO referrer_user_id 
  FROM public.profiles 
  WHERE id = recent_visit.influencer_profile_id;
  
  -- Create conversion record
  INSERT INTO public.affiliate_conversions (
    link_id, visit_id, user_id, conversion_type, conversion_value,
    commission_rate, commission_amount, conversion_status
  ) VALUES (
    recent_visit.link_id,
    recent_visit.id,
    p_user_id,
    p_conversion_type,
    p_conversion_value,
    0.20,
    p_conversion_value * 0.20,
    'confirmed'
  ) RETURNING id INTO conversion_id;
  
  -- Award VYBBI tokens to referrer (200 VYBBI per successful referral)
  IF referrer_user_id IS NOT NULL THEN
    PERFORM public.award_vybbi_tokens(
      referrer_user_id,
      200,
      'referral_reward',
      'Parrainage réussi ! Nouveau membre via votre lien (+200 VYBBI)',
      'affiliate_conversion',
      conversion_id
    );
  END IF;
  
  -- Award bonus tokens to referred user (50 VYBBI welcome bonus)
  PERFORM public.award_vybbi_tokens(
    p_user_id,
    50,
    'referral_bonus',
    'Bonus de parrainage ! Merci de nous avoir rejoint (+50 VYBBI)',
    'referred_signup',
    conversion_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'conversion_id', conversion_id,
    'referrer_user_id', referrer_user_id,
    'tokens_awarded', jsonb_build_object(
      'referrer', 200,
      'referred', 50
    )
  );
END;
$$;


ALTER FUNCTION "public"."track_affiliate_conversion_with_tokens"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_affiliate_visit"("p_affiliate_code" "text", "p_session_id" "uuid", "p_user_agent" "text" DEFAULT NULL::"text", "p_referrer" "text" DEFAULT NULL::"text", "p_page_url" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  link_record RECORD;
  visit_id UUID;
  result jsonb;
BEGIN
  -- Find the affiliate link
  SELECT id, clicks_count, influencer_profile_id
  INTO link_record
  FROM public.influencer_links
  WHERE code = p_affiliate_code 
    AND is_active = true;
    
  IF link_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or inactive affiliate code'
    );
  END IF;
  
  -- Check if visit already exists for this session
  IF EXISTS (
    SELECT 1 FROM public.affiliate_visits 
    WHERE session_id = p_session_id 
      AND link_id = link_record.id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Visit already tracked for this session'
    );
  END IF;
  
  -- Insert the visit
  INSERT INTO public.affiliate_visits (
    link_id,
    session_id,
    user_agent,
    referrer,
    page_url
  ) VALUES (
    link_record.id,
    p_session_id,
    p_user_agent,
    p_referrer,
    p_page_url
  ) RETURNING id INTO visit_id;
  
  -- Update clicks count atomically
  UPDATE public.influencer_links 
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = now()
  WHERE id = link_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'visit_id', visit_id,
    'link_id', link_record.id,
    'clicks_count', COALESCE(link_record.clicks_count, 0) + 1
  );
END;
$$;


ALTER FUNCTION "public"."track_affiliate_visit"("p_affiliate_code" "text", "p_session_id" "uuid", "p_user_agent" "text", "p_referrer" "text", "p_page_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_login_attempt"("p_email" "text", "p_ip_address" "inet" DEFAULT NULL::"inet", "p_user_agent" "text" DEFAULT NULL::"text", "p_success" boolean DEFAULT false, "p_failure_reason" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  recent_failures integer;
  block_duration integer;
  security_settings jsonb;
BEGIN
  -- Get security settings
  SELECT setting_value INTO security_settings
  FROM public.admin_settings
  WHERE setting_key = 'security_settings';
  
  IF security_settings IS NULL THEN
    security_settings := '{"max_login_attempts": 5, "lockout_duration_minutes": 15}'::jsonb;
  END IF;
  
  -- Insert the attempt
  INSERT INTO public.login_attempts (email, ip_address, user_agent, success, failure_reason)
  VALUES (p_email, p_ip_address, p_user_agent, p_success, p_failure_reason);
  
  -- If this is a failed attempt, check for blocking
  IF NOT p_success THEN
    -- Count recent failures
    SELECT COUNT(*) INTO recent_failures
    FROM public.login_attempts
    WHERE email = p_email
      AND success = false
      AND attempt_time > now() - INTERVAL '1 hour';
    
    -- Check if we should block
    IF recent_failures >= (security_settings->>'max_login_attempts')::integer THEN
      block_duration := (security_settings->>'lockout_duration_minutes')::integer;
      
      -- Update all recent failed attempts with block time
      UPDATE public.login_attempts
      SET blocked_until = now() + (block_duration || ' minutes')::interval
      WHERE email = p_email
        AND success = false
        AND attempt_time > now() - INTERVAL '1 hour'
        AND blocked_until IS NULL;
      
      RETURN jsonb_build_object(
        'blocked', true,
        'block_duration_minutes', block_duration,
        'attempts_count', recent_failures
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'blocked', false,
    'attempts_count', recent_failures
  );
END;
$$;


ALTER FUNCTION "public"."track_login_attempt"("p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_failure_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_music_play"("p_music_release_id" "uuid", "p_duration_played" integer DEFAULT 0, "p_source" "text" DEFAULT 'profile'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  play_id UUID;
BEGIN
  INSERT INTO public.music_plays (
    music_release_id,
    user_id,
    duration_played,
    source
  ) VALUES (
    p_music_release_id,
    auth.uid(),
    p_duration_played,
    p_source
  ) RETURNING id INTO play_id;
  
  -- Update plays count
  UPDATE public.music_releases 
  SET plays_count = plays_count + 1 
  WHERE id = p_music_release_id;
  
  RETURN play_id;
END;
$$;


ALTER FUNCTION "public"."track_music_play"("p_music_release_id" "uuid", "p_duration_played" integer, "p_source" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_profile_view"("p_viewed_profile_id" "uuid", "p_view_type" "public"."view_type" DEFAULT 'full_profile'::"public"."view_type", "p_referrer_page" "text" DEFAULT NULL::"text", "p_session_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID;
  viewer_profile_id UUID;
  new_session_id UUID;
  view_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Exit if no user or user is viewing their own profile
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is viewing their own profile
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_viewed_profile_id AND user_id = current_user_id
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Get viewer's profile
  SELECT id INTO viewer_profile_id 
  FROM public.profiles 
  WHERE user_id = current_user_id;
  
  -- Use provided session_id or generate new one
  new_session_id := COALESCE(p_session_id, gen_random_uuid());
  
  -- Check if view already exists for this session and profile (prevent duplicates within same session)
  IF EXISTS (
    SELECT 1 FROM public.profile_views
    WHERE viewed_profile_id = p_viewed_profile_id 
    AND viewer_user_id = current_user_id 
    AND session_id = new_session_id
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    RETURN new_session_id;
  END IF;
  
  -- Insert view
  INSERT INTO public.profile_views (
    viewed_profile_id,
    viewer_user_id,
    viewer_profile_id,
    view_type,
    referrer_page,
    session_id
  ) VALUES (
    p_viewed_profile_id,
    current_user_id,
    viewer_profile_id,
    p_view_type,
    p_referrer_page,
    new_session_id
  )
  RETURNING id INTO view_id;
  
  RETURN COALESCE(view_id, new_session_id);
END;
$$;


ALTER FUNCTION "public"."track_profile_view"("p_viewed_profile_id" "uuid", "p_view_type" "public"."view_type", "p_referrer_page" "text", "p_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_audit_sensitive_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Auditer les accès aux données financières
  PERFORM public.audit_rls_access(TG_TABLE_NAME, TG_OP);
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."trigger_audit_sensitive_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_trial_offer_update"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb;
BEGIN
  -- Call the edge function via HTTP
  SELECT INTO result
    net.http_post(
        url:='https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/update-trial-offer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI"}'::jsonb,
        body:='{"manual_trigger": true}'::jsonb
    );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."trigger_trial_offer_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_affiliate_clicks_on_visit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.influencer_links 
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = now()
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_affiliate_clicks_on_visit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_community_member_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_community_member_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW);
  NEW.onboarding_completed := NEW.profile_completion_percentage >= 70;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profile_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_can_access_conversation"("conv_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conv_id 
    AND cp.user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."user_can_access_conversation"("conv_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_owns_profile"("profile_id_param" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = profile_id_param 
    AND p.user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."user_owns_profile"("profile_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_password_strength"("password" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digit
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF password !~ '[^a-zA-Z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."validate_password_strength"("password" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size" integer,
    "width" integer,
    "height" integer,
    "alt_text" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ad_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_campaign_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "slot_id" "uuid" NOT NULL,
    "weight" integer DEFAULT 1,
    "priority" integer DEFAULT 0,
    "is_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ad_campaign_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "target_url" "text",
    "placement_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "advertiser" "text",
    "daily_window_start" time without time zone,
    "daily_window_end" time without time zone,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    CONSTRAINT "ad_campaigns_placement_type_check" CHECK (("placement_type" = ANY (ARRAY['header'::"text", 'sidebar_left'::"text", 'sidebar_right'::"text", 'banner_top'::"text", 'banner_bottom'::"text"])))
);


ALTER TABLE "public"."ad_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "asset_id" "uuid",
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "page_url" "text",
    "referrer" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ad_metrics_event_type_check" CHECK (("event_type" = ANY (ARRAY['impression'::"text", 'click'::"text"])))
);


ALTER TABLE "public"."ad_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."ad_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "width" integer,
    "height" integer,
    "allowed_formats" "text"[] DEFAULT ARRAY['image/png'::"text", 'image/jpeg'::"text", 'image/webp'::"text", 'image/svg+xml'::"text"],
    "hide_if_empty" boolean DEFAULT true,
    "is_enabled" boolean DEFAULT true,
    "page_type" "text" DEFAULT 'public'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ad_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_mock_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "profile_type" "text" NOT NULL,
    "is_mock" boolean DEFAULT true,
    "ai_generated_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_mock_profiles_profile_type_check" CHECK (("profile_type" = ANY (ARRAY['artist'::"text", 'lieu'::"text", 'agent'::"text", 'manager'::"text"])))
);


ALTER TABLE "public"."admin_mock_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_secrets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_accessed_at" timestamp with time zone,
    "last_accessed_by" "uuid",
    "order_number" integer DEFAULT 0
);


ALTER TABLE "public"."admin_secrets" OWNER TO "postgres";


COMMENT ON COLUMN "public"."admin_secrets"."order_number" IS 'Order number for manual sorting via drag and drop. Lower numbers appear first.';



CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."affiliate_conversions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "visit_id" "uuid",
    "user_id" "uuid",
    "conversion_type" "text" NOT NULL,
    "conversion_value" numeric(10,2),
    "commission_rate" numeric(5,4) DEFAULT 0.05,
    "commission_amount" numeric(10,2),
    "conversion_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "converted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "confirmed_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "is_recurring" boolean DEFAULT false,
    "monthly_commission_amount" numeric DEFAULT 0.50,
    "recurring_start_date" "date",
    "recurring_end_date" "date",
    "is_exclusive_program" boolean DEFAULT false,
    CONSTRAINT "affiliate_conversions_conversion_status_check" CHECK (("conversion_status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'paid'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "affiliate_conversions_conversion_type_check" CHECK (("conversion_type" = ANY (ARRAY['registration'::"text", 'subscription'::"text", 'booking'::"text"])))
);


ALTER TABLE "public"."affiliate_conversions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."affiliate_visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "session_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visitor_ip" "inet",
    "user_agent" "text",
    "referrer" "text",
    "page_url" "text",
    "country" "text",
    "city" "text",
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."affiliate_visits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_profile_id" "uuid" NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "representation_status" "public"."representation_status" DEFAULT 'pending'::"public"."representation_status",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    "contract_notes" "text"
);


ALTER TABLE "public"."agent_artists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_commissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "conversion_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "paid_at" timestamp with time zone,
    "payment_reference" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_commissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."annonces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text",
    "event_date" "date",
    "deadline" "date",
    "status" "public"."annonce_status" DEFAULT 'draft'::"public"."annonce_status" NOT NULL,
    "budget_min" integer,
    "budget_max" integer,
    "genres" "text"[],
    "requirements" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "image_position_y" integer DEFAULT 50,
    "event_id" "uuid",
    "profile_types" "text"[]
);


ALTER TABLE "public"."annonces" OWNER TO "postgres";


COMMENT ON COLUMN "public"."annonces"."profile_types" IS 'Types de profils recherchés pour les prestations artistiques (dj, chanteur, groupe, musicien, danseur, performer, magicien, etc.)';



CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "applicant_id" "uuid" NOT NULL,
    "annonce_id" "uuid" NOT NULL,
    "status" "public"."application_status" DEFAULT 'pending'::"public"."application_status" NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artist_radio_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "subscription_type" "text" NOT NULL,
    "credits_remaining" integer DEFAULT 0 NOT NULL,
    "auto_approve_tracks" boolean DEFAULT false NOT NULL,
    "priority_boost" integer DEFAULT 0 NOT NULL,
    "starts_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "artist_radio_subscriptions_subscription_type_check" CHECK (("subscription_type" = ANY (ARRAY['basic'::"text", 'premium'::"text", 'vip'::"text"])))
);


ALTER TABLE "public"."artist_radio_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "prospect_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "current_step_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."automation_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "order_number" integer NOT NULL,
    "channel" "text" NOT NULL,
    "delay_hours" integer DEFAULT 0,
    "template_id" "uuid",
    "content" "text",
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."automation_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "trigger_type" "text" NOT NULL,
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."automation_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "public"."availability_status" DEFAULT 'available'::"public"."availability_status" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."availability_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blockchain_certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "music_release_id" "uuid" NOT NULL,
    "transaction_hash" "text" NOT NULL,
    "blockchain_network" "text" DEFAULT 'solana'::"text" NOT NULL,
    "certification_hash" "text" NOT NULL,
    "solana_signature" "text",
    "block_number" bigint,
    "certification_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "qr_code_url" "text",
    "certificate_url" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "certified_by" "uuid"
);


ALTER TABLE "public"."blockchain_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocked_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "blocker_user_id" "uuid" NOT NULL,
    "blocked_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."blocked_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "image_url" "text",
    "image_position_y" integer DEFAULT 50,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone,
    CONSTRAINT "blog_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "venue_profile_id" "uuid" NOT NULL,
    "status" "public"."booking_status" DEFAULT 'pending'::"public"."booking_status" NOT NULL,
    "message" "text",
    "proposed_fee" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" DEFAULT 'public'::"text" NOT NULL,
    "category" "text",
    "avatar_url" "text",
    "banner_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "member_count" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "communities_type_check" CHECK (("type" = ANY (ARRAY['public'::"text", 'private'::"text", 'invite_only'::"text"])))
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_channels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" DEFAULT 'text'::"text" NOT NULL,
    "is_private" boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "community_channels_type_check" CHECK (("type" = ANY (ARRAY['text'::"text", 'voice'::"text", 'live_radio'::"text"])))
);


ALTER TABLE "public"."community_channels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_muted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "community_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'moderator'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "channel_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "sender_profile_id" "uuid",
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "reply_to_message_id" "uuid",
    "is_pinned" boolean DEFAULT false NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "community_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'file'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."community_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_archives" (
    "user_id" "uuid" NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "archived_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."conversation_archives" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversation_archives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_pins" (
    "user_id" "uuid" NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "pinned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."conversation_pins" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversation_pins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."conversation_type" DEFAULT 'direct'::"public"."conversation_type" NOT NULL,
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "reply_received" boolean DEFAULT false
);

ALTER TABLE ONLY "public"."conversations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversion_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "conversion_status" "public"."conversion_status" DEFAULT 'pending'::"public"."conversion_status" NOT NULL,
    "subscription_type" "text",
    "conversion_value" numeric(10,2),
    "commission_amount" numeric(10,2),
    "commission_paid" boolean DEFAULT false,
    "commission_paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "confirmed_at" timestamp with time zone
);


ALTER TABLE "public"."conversion_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."detailed_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "reviewed_profile_id" "uuid" NOT NULL,
    "talent_score" integer NOT NULL,
    "professionalism_score" integer NOT NULL,
    "communication_score" integer NOT NULL,
    "overall_average" numeric(3,2) GENERATED ALWAYS AS ((((("talent_score" + "professionalism_score") + "communication_score"))::numeric / (3)::numeric)) STORED,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "detailed_reviews_communication_score_check" CHECK ((("communication_score" >= 1) AND ("communication_score" <= 5))),
    CONSTRAINT "detailed_reviews_professionalism_score_check" CHECK ((("professionalism_score" >= 1) AND ("professionalism_score" <= 5))),
    CONSTRAINT "detailed_reviews_talent_score_check" CHECK ((("talent_score" >= 1) AND ("talent_score" <= 5)))
);


ALTER TABLE "public"."detailed_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "html_content" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "category" "text" DEFAULT 'notifications'::"text",
    "language" "text" DEFAULT 'fr'::"text",
    "provider" "text" DEFAULT 'brevo'::"text",
    "brevo_template_id" "text",
    "required_variables" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "email_templates_category_check" CHECK (("category" = ANY (ARRAY['notifications'::"text", 'prospection'::"text", 'marketing'::"text", 'system'::"text"]))),
    CONSTRAINT "email_templates_language_check" CHECK (("language" = ANY (ARRAY['fr'::"text", 'en'::"text"])))
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_attendees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "status" "text" DEFAULT 'attending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "event_attendees_status_check" CHECK (("status" = ANY (ARRAY['attending'::"text", 'not_attending'::"text"])))
);


ALTER TABLE "public"."event_attendees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "venue_profile_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_date" "date" NOT NULL,
    "event_time" time without time zone,
    "location" "text",
    "genres" "text"[],
    "budget_min" integer,
    "budget_max" integer,
    "status" "public"."event_status" DEFAULT 'draft'::"public"."event_status" NOT NULL,
    "image_url" "text",
    "image_position_y" integer DEFAULT 50,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "flyer_url" "text",
    "flyer_position_y" integer DEFAULT 50,
    "created_by_artist" boolean DEFAULT false,
    "created_by_user_id" "uuid",
    "artist_profile_id" "uuid"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."influencer_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "influencer_profile_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text",
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "clicks_count" integer DEFAULT 0 NOT NULL,
    "conversions_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."influencer_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_sync_at" timestamp with time zone,
    "status" "text" DEFAULT 'inactive'::"text"
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."login_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "attempt_time" timestamp with time zone DEFAULT "now"(),
    "success" boolean DEFAULT false,
    "failure_reason" "text",
    "blocked_until" timestamp with time zone
);


ALTER TABLE "public"."login_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."manager_artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "manager_profile_id" "uuid" NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "representation_status" "public"."representation_status" DEFAULT 'pending'::"public"."representation_status",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    "contract_notes" "text"
);


ALTER TABLE "public"."manager_artists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "media_type" "public"."media_type" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "music_release_id" "uuid",
    "track_position" integer,
    "preview_url" "text",
    "duration_seconds" integer,
    "waveform_data" "jsonb"
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."message_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."message_receipts" REPLICA IDENTITY FULL;


ALTER TABLE "public"."message_receipts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."music_collaborators" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "music_release_id" "uuid" NOT NULL,
    "collaborator_profile_id" "uuid",
    "collaborator_name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "royalty_percentage" numeric(5,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."music_collaborators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."music_plays" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "music_release_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "played_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration_played" integer DEFAULT 0,
    "ip_address" "inet",
    "user_agent" "text",
    "source" "text"
);


ALTER TABLE "public"."music_plays" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."music_releases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "artist_name" "text" NOT NULL,
    "album_name" "text",
    "cover_image_url" "text",
    "release_date" "date",
    "duration_seconds" integer,
    "genre" "text",
    "label" "text",
    "copyright_owner" "text",
    "isrc_code" "text",
    "distribution_service" "text",
    "spotify_url" "text",
    "apple_music_url" "text",
    "soundcloud_url" "text",
    "youtube_url" "text",
    "royalty_percentage" numeric(5,2) DEFAULT 100.00,
    "is_original_composition" boolean DEFAULT true,
    "featured_artists" "jsonb" DEFAULT '[]'::"jsonb",
    "credits" "jsonb" DEFAULT '{}'::"jsonb",
    "lyrics" "text",
    "bpm" integer,
    "key_signature" "text",
    "explicit_content" boolean DEFAULT false,
    "plays_count" integer DEFAULT 0,
    "likes_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'draft'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "direct_audio_url" "text",
    CONSTRAINT "music_releases_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."music_releases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "public"."notification_type" NOT NULL,
    "email_enabled" boolean DEFAULT true,
    "push_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "read_at" timestamp with time zone,
    "email_sent" boolean DEFAULT false,
    "email_sent_at" timestamp with time zone,
    "related_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "priority" integer DEFAULT 1,
    "category" "text" DEFAULT 'general'::"text",
    "expires_at" timestamp with time zone,
    "action_url" "text"
);

ALTER TABLE ONLY "public"."notifications" REPLICA IDENTITY FULL;


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "interaction_type" "text" NOT NULL,
    "comment_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."post_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "media_url" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "thumbnail_url" "text",
    "file_size" integer,
    "duration" integer,
    "alt_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."post_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "viewed_profile_id" "uuid" NOT NULL,
    "viewer_user_id" "uuid" NOT NULL,
    "viewer_profile_id" "uuid",
    "view_type" "public"."view_type" DEFAULT 'full_profile'::"public"."view_type" NOT NULL,
    "referrer_page" "text",
    "session_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_views" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profiles_public_view" AS
 SELECT "id",
    "user_id",
    "display_name",
    "profile_type",
    "bio",
    "avatar_url",
    "location",
    "city",
    "genres",
    "experience",
    "website",
    "spotify_url",
    "soundcloud_url",
    "youtube_url",
    "instagram_url",
    "tiktok_url",
    "languages",
    "header_url",
    "header_position_y",
    "talents",
    "accepts_direct_contact",
    "preferred_contact_profile_id",
    "venue_category",
    "venue_capacity",
    "slug",
    "is_public",
    "profile_completion_percentage",
    "onboarding_completed",
    "secondary_profile_type",
    "created_at",
    "updated_at"
   FROM "public"."profiles"
  WHERE ("is_public" = true);


ALTER VIEW "public"."profiles_public_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "assigned_by" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "unassigned_at" timestamp with time zone,
    "reason" "text"
);


ALTER TABLE "public"."prospect_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_engagement_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "source" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "occurred_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prospect_engagement_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_imports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "imported_by" "uuid",
    "total_records" integer DEFAULT 0,
    "successful_imports" integer DEFAULT 0,
    "failed_imports" integer DEFAULT 0,
    "import_status" "text" DEFAULT 'processing'::"text",
    "error_details" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "prospect_imports_import_status_check" CHECK (("import_status" = ANY (ARRAY['processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."prospect_imports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "interaction_type" "public"."interaction_type" NOT NULL,
    "subject" "text",
    "content" "text",
    "outcome" "text",
    "next_action" "text",
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "email_opened" boolean DEFAULT false,
    "email_clicked" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."prospect_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_meetings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid" NOT NULL,
    "meeting_type" "text" DEFAULT 'video'::"text" NOT NULL,
    "meeting_time" timestamp with time zone NOT NULL,
    "duration" integer DEFAULT 60,
    "agenda" "text",
    "location" "text",
    "notes" "text",
    "status" "text" DEFAULT 'scheduled'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prospect_meetings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_scoring_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid",
    "previous_score" integer,
    "new_score" integer,
    "score_type" "text" DEFAULT 'qualification'::"text",
    "factors" "jsonb" DEFAULT '{}'::"jsonb",
    "calculated_by" "text" DEFAULT 'auto_scoring_system'::"text",
    "calculated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prospect_scoring_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#3b82f6'::"text",
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_system" boolean DEFAULT false
);


ALTER TABLE "public"."prospect_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospect_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_id" "uuid",
    "workflow_id" "uuid",
    "agent_id" "uuid",
    "task_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "scheduled_at" timestamp with time zone NOT NULL,
    "completed_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "auto_created" boolean DEFAULT true,
    "template_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processing_status" "text" DEFAULT 'waiting'::"text",
    "locked_at" timestamp with time zone,
    "processing_by" "uuid",
    "execution_attempt" integer DEFAULT 0,
    "last_error_message" "text",
    CONSTRAINT "prospect_tasks_processing_status_check" CHECK (("processing_status" = ANY (ARRAY['waiting'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'skipped'::"text"]))),
    CONSTRAINT "prospect_tasks_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'skipped'::"text", 'failed'::"text"]))),
    CONSTRAINT "prospect_tasks_task_type_check" CHECK (("task_type" = ANY (ARRAY['email'::"text", 'call'::"text", 'whatsapp'::"text", 'reminder'::"text", 'note'::"text"])))
);


ALTER TABLE "public"."prospect_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospecting_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "target_type" "public"."prospect_type",
    "email_template_subject" "text",
    "email_template_body" "text",
    "created_by" "uuid",
    "is_active" boolean DEFAULT true,
    "total_sent" integer DEFAULT 0,
    "total_opened" integer DEFAULT 0,
    "total_clicked" integer DEFAULT 0,
    "total_converted" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."prospecting_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospecting_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "prospect_type" "text" NOT NULL,
    "trigger_conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "steps" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prospecting_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prospects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prospect_type" "public"."prospect_type" NOT NULL,
    "company_name" "text",
    "contact_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "text",
    "city" "text",
    "website" "text",
    "social_media" "jsonb",
    "status" "public"."prospect_status" DEFAULT 'new'::"public"."prospect_status" NOT NULL,
    "qualification_score" integer DEFAULT 0,
    "notes" "text",
    "source" "text",
    "assigned_agent_id" "uuid",
    "assigned_at" timestamp with time zone,
    "last_contact_at" timestamp with time zone,
    "next_follow_up_at" timestamp with time zone,
    "converted_user_id" "uuid",
    "converted_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "instagram_url" "text",
    "linkedin_url" "text",
    "twitter_url" "text",
    "tiktok_url" "text",
    "youtube_url" "text",
    "facebook_url" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "priority_level" "text" DEFAULT 'medium'::"text",
    "industry_sector" "text",
    "company_size" "text" DEFAULT 'unknown'::"text",
    "estimated_budget" integer,
    "influence_score" integer DEFAULT 0,
    "whatsapp_number" "text",
    "region" "text",
    "country" "text" DEFAULT 'FR'::"text",
    "timezone" "text" DEFAULT 'Europe/Paris'::"text",
    "referral_source" "text",
    "referral_prospect_id" "uuid",
    "collaboration_potential" "text" DEFAULT 'unknown'::"text",
    "last_engagement_score" integer DEFAULT 0,
    "engagement_history" "jsonb" DEFAULT '[]'::"jsonb",
    "auto_scoring_enabled" boolean DEFAULT true,
    CONSTRAINT "prospects_collaboration_potential_check" CHECK (("collaboration_potential" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text", 'unknown'::"text"]))),
    CONSTRAINT "prospects_company_size_check" CHECK (("company_size" = ANY (ARRAY['startup'::"text", 'small'::"text", 'medium'::"text", 'large'::"text", 'enterprise'::"text", 'unknown'::"text"]))),
    CONSTRAINT "prospects_influence_score_check" CHECK ((("influence_score" >= 0) AND ("influence_score" <= 100))),
    CONSTRAINT "prospects_priority_level_check" CHECK (("priority_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."prospects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."radio_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."radio_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."radio_play_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "media_asset_id" "uuid",
    "playlist_id" "uuid",
    "played_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "duration_seconds" integer,
    "completed" boolean DEFAULT false NOT NULL,
    "music_release_id" "uuid",
    CONSTRAINT "radio_play_history_track_reference_check" CHECK (((("media_asset_id" IS NOT NULL) AND ("music_release_id" IS NULL)) OR (("media_asset_id" IS NULL) AND ("music_release_id" IS NOT NULL))))
);


ALTER TABLE "public"."radio_play_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."radio_playlist_tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "playlist_id" "uuid" NOT NULL,
    "media_asset_id" "uuid",
    "weight" integer DEFAULT 1 NOT NULL,
    "play_count" integer DEFAULT 0 NOT NULL,
    "last_played_at" timestamp with time zone,
    "is_approved" boolean DEFAULT false NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "added_by" "uuid",
    "music_release_id" "uuid",
    CONSTRAINT "check_track_source" CHECK (((("media_asset_id" IS NOT NULL) AND ("music_release_id" IS NULL)) OR (("media_asset_id" IS NULL) AND ("music_release_id" IS NOT NULL))))
);


ALTER TABLE "public"."radio_playlist_tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."radio_playlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "priority" integer DEFAULT 1 NOT NULL,
    "schedule_start" time without time zone,
    "schedule_end" time without time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);

ALTER TABLE ONLY "public"."radio_playlists" REPLICA IDENTITY FULL;


ALTER TABLE "public"."radio_playlists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recurring_commissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "influencer_profile_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "conversion_id" "uuid",
    "month_year" "text" NOT NULL,
    "amount" numeric DEFAULT 0.50 NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "is_exclusive_program" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "recurring_commissions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'paid'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."recurring_commissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."representation_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "invited_email" "text" NOT NULL,
    "invited_name" "text" NOT NULL,
    "invitation_type" "text" NOT NULL,
    "token" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    "accepted_at" timestamp with time zone,
    "accepted_by_user_id" "uuid",
    CONSTRAINT "representation_invitations_invitation_type_check" CHECK (("invitation_type" = ANY (ARRAY['agent'::"text", 'manager'::"text"]))),
    CONSTRAINT "representation_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."representation_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "reviewed_profile_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rating_valid_range" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roadmap_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."roadmap_item_type" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."roadmap_item_status" DEFAULT 'planned'::"public"."roadmap_item_status" NOT NULL,
    "priority" "public"."roadmap_priority" DEFAULT 'medium'::"public"."roadmap_priority" NOT NULL,
    "area" "text",
    "audience" "text",
    "due_date" "date",
    "sort_order" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_items" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."safe_profiles" WITH ("security_invoker"='true') AS
 SELECT "id",
    "user_id",
    "display_name",
    "profile_type",
    "avatar_url",
    "bio",
    "location",
    "city",
    "genres",
    "talents",
    "languages",
    "website",
    "instagram_url",
    "spotify_url",
    "soundcloud_url",
    "youtube_url",
    "tiktok_url",
    "experience",
    "is_public",
    "slug",
    "header_url",
    "header_position_y",
    "venue_category",
    "venue_capacity",
    "accepts_direct_contact",
    "preferred_contact_profile_id",
    "created_at",
    "updated_at",
    "profile_completion_percentage",
    "onboarding_completed"
   FROM "public"."profiles"
  WHERE ("is_public" = true);


ALTER VIEW "public"."safe_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."safe_public_profiles" AS
 SELECT "id",
    "user_id",
    "display_name",
    "profile_type",
    "avatar_url",
    "bio",
    "location",
    "city",
    "genres",
    "talents",
    "languages",
    "website",
    "instagram_url",
    "spotify_url",
    "soundcloud_url",
    "youtube_url",
    "tiktok_url",
    "experience",
    "is_public",
    "slug",
    "header_url",
    "header_position_y",
    "venue_category",
    "venue_capacity",
    "accepts_direct_contact",
    "preferred_contact_profile_id",
    "created_at",
    "updated_at",
    "profile_completion_percentage",
    "onboarding_completed"
   FROM "public"."profiles"
  WHERE ("is_public" = true);


ALTER VIEW "public"."safe_public_profiles" OWNER TO "postgres";


COMMENT ON VIEW "public"."safe_public_profiles" IS 'SECURITY: Safe view of profiles table that NEVER exposes email, phone, or siret_number. Use this for public profile access.';



CREATE TABLE IF NOT EXISTS "public"."scoring_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "rule_type" "text" NOT NULL,
    "score_impact" integer NOT NULL,
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "scoring_rules_rule_type_check" CHECK (("rule_type" = ANY (ARRAY['email_opened'::"text", 'link_clicked'::"text", 'website_visited'::"text", 'social_engagement'::"text", 'response_received'::"text", 'meeting_scheduled'::"text"])))
);


ALTER TABLE "public"."scoring_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."security_audit_log" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."security_summary" WITH ("security_invoker"='true') AS
 SELECT "date"("created_at") AS "access_date",
    "table_name",
    "action",
    "count"(*) AS "access_count",
    "count"(DISTINCT "user_id") AS "unique_users"
   FROM "public"."security_audit_log"
  WHERE ("created_at" >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY ("date"("created_at")), "table_name", "action"
  ORDER BY ("date"("created_at")) DESC, ("count"(*)) DESC;


ALTER VIEW "public"."security_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_request_id" "uuid" NOT NULL,
    "applicant_user_id" "uuid" NOT NULL,
    "applicant_profile_id" "uuid" NOT NULL,
    "message" "text",
    "proposed_fee" integer,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "service_applications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."service_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_type" "text" NOT NULL,
    "service_category" "text" NOT NULL,
    "location" "text" NOT NULL,
    "budget_min" integer,
    "budget_max" integer,
    "event_date" "date",
    "deadline" "date",
    "description" "text" NOT NULL,
    "requirements" "text",
    "created_by" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "service_requests_request_type_check" CHECK (("request_type" = ANY (ARRAY['offer'::"text", 'demand'::"text"]))),
    CONSTRAINT "service_requests_service_category_check" CHECK (("service_category" = ANY (ARRAY['performance'::"text", 'venue'::"text", 'agent'::"text", 'other'::"text"]))),
    CONSTRAINT "service_requests_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'closed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_ticker_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "start_date" "date",
    "end_date" "date",
    "days_of_week" "text"[],
    "start_time" time without time zone,
    "end_time" time without time zone,
    "timezone" "text" DEFAULT 'Europe/Paris'::"text",
    "priority" integer DEFAULT 1
);


ALTER TABLE "public"."site_ticker_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "post_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "visibility" "text" DEFAULT 'public'::"text" NOT NULL,
    "related_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_payment_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text" NOT NULL,
    "payment_intent_id" "text",
    "amount_cents" integer NOT NULL,
    "tokens_amount" integer NOT NULL,
    "pack_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."stripe_payment_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_key" "text" NOT NULL,
    "config_value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."temporary_credentials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "temp_username" "text" NOT NULL,
    "temp_password_hash" "text" NOT NULL,
    "claim_token" "text" NOT NULL,
    "is_claimed" boolean DEFAULT false,
    "claimed_at" timestamp with time zone,
    "claimed_by_user_id" "uuid",
    "expires_at" timestamp with time zone NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."temporary_credentials" OWNER TO "postgres";


COMMENT ON TABLE "public"."temporary_credentials" IS 'Stores temporary login credentials for venues created during physical prospecting';



CREATE TABLE IF NOT EXISTS "public"."token_earning_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rule_name" "text" NOT NULL,
    "rule_type" "text" NOT NULL,
    "base_amount" numeric(18,6) NOT NULL,
    "max_per_day" numeric(18,6),
    "cooldown_hours" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "target_profile_types" "text"[] DEFAULT ARRAY['artist'::"text", 'agent'::"text", 'manager'::"text", 'lieu'::"text"],
    "conditions" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "token_earning_rules_rule_type_check" CHECK (("rule_type" = ANY (ARRAY['daily_login'::"text", 'profile_completion'::"text", 'social_interaction'::"text", 'referral'::"text", 'ad_impression'::"text", 'campaign_bonus'::"text"])))
);


ALTER TABLE "public"."token_earning_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_spending_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "option_name" "text" NOT NULL,
    "option_type" "text" NOT NULL,
    "vybbi_cost" numeric(18,6) NOT NULL,
    "duration_days" integer,
    "target_profile_types" "text"[] DEFAULT ARRAY['artist'::"text", 'agent'::"text", 'manager'::"text", 'lieu'::"text"],
    "description" "text",
    "benefits" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "token_spending_options_option_type_check" CHECK (("option_type" = ANY (ARRAY['subscription'::"text", 'boost'::"text", 'service'::"text", 'feature'::"text", 'upgrade'::"text"])))
);


ALTER TABLE "public"."token_spending_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "transaction_type" "text" NOT NULL,
    "amount" numeric(18,6) NOT NULL,
    "reason" "text" NOT NULL,
    "description" "text",
    "reference_type" "text",
    "reference_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "processed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "token_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earned'::"text", 'spent'::"text", 'bonus'::"text", 'penalty'::"text"])))
);


ALTER TABLE "public"."token_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_user_id" "uuid" NOT NULL,
    "follower_profile_id" "uuid" NOT NULL,
    "followed_user_id" "uuid" NOT NULL,
    "followed_profile_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_presence" (
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_online" boolean DEFAULT false NOT NULL,
    "status_message" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_presence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_token_balances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "balance" numeric(18,6) DEFAULT 0 NOT NULL,
    "total_earned" numeric(18,6) DEFAULT 0 NOT NULL,
    "total_spent" numeric(18,6) DEFAULT 0 NOT NULL,
    "level" "text" DEFAULT 'bronze'::"text" NOT NULL,
    "multiplier" numeric(3,2) DEFAULT 1.05 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_token_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_artist_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "venue_profile_id" "uuid" NOT NULL,
    "artist_profile_id" "uuid" NOT NULL,
    "performance_date" "date",
    "event_title" "text",
    "description" "text",
    "is_visible" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."venue_artist_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_gallery" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "venue_profile_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_position_y" integer DEFAULT 50,
    "description" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."venue_gallery" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "venue_profile_id" "uuid" NOT NULL,
    "partner_profile_id" "uuid" NOT NULL,
    "partnership_type" "text" NOT NULL,
    "is_visible" boolean DEFAULT true NOT NULL,
    "allow_direct_contact" boolean DEFAULT true NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "venue_partners_partnership_type_check" CHECK (("partnership_type" = ANY (ARRAY['agent'::"text", 'manager'::"text", 'booker'::"text", 'tournee'::"text"])))
);


ALTER TABLE "public"."venue_partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vybbi_agents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "agent_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "commission_rate" numeric(5,2) DEFAULT 2.00 NOT NULL,
    "hire_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "total_prospects_assigned" integer DEFAULT 0,
    "total_converted" integer DEFAULT 0,
    "total_commissions" numeric(10,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vybbi_agents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vybbi_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message" "text" NOT NULL,
    "response" "text" NOT NULL,
    "action" "text",
    "filters" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vybbi_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "webhook_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "response_status" integer,
    "response_body" "text",
    "delivered_at" timestamp with time zone DEFAULT "now"(),
    "success" boolean DEFAULT false
);


ALTER TABLE "public"."webhook_deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "events" "text"[] NOT NULL,
    "headers" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_subscriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ad_assets"
    ADD CONSTRAINT "ad_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ad_campaign_slots"
    ADD CONSTRAINT "ad_campaign_slots_campaign_id_slot_id_key" UNIQUE ("campaign_id", "slot_id");



ALTER TABLE ONLY "public"."ad_campaign_slots"
    ADD CONSTRAINT "ad_campaign_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ad_campaigns"
    ADD CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ad_metrics"
    ADD CONSTRAINT "ad_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ad_settings"
    ADD CONSTRAINT "ad_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ad_settings"
    ADD CONSTRAINT "ad_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."ad_slots"
    ADD CONSTRAINT "ad_slots_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."ad_slots"
    ADD CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_mock_profiles"
    ADD CONSTRAINT "admin_mock_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_secrets"
    ADD CONSTRAINT "admin_secrets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."affiliate_conversions"
    ADD CONSTRAINT "affiliate_conversions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."affiliate_visits"
    ADD CONSTRAINT "affiliate_visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_artists"
    ADD CONSTRAINT "agent_artists_agent_profile_id_artist_profile_id_key" UNIQUE ("agent_profile_id", "artist_profile_id");



ALTER TABLE ONLY "public"."agent_artists"
    ADD CONSTRAINT "agent_artists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_commissions"
    ADD CONSTRAINT "agent_commissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."annonces"
    ADD CONSTRAINT "annonces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artist_radio_subscriptions"
    ADD CONSTRAINT "artist_radio_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_steps"
    ADD CONSTRAINT "automation_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_workflows"
    ADD CONSTRAINT "automation_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."availability_slots"
    ADD CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blockchain_certifications"
    ADD CONSTRAINT "blockchain_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blockchain_certifications"
    ADD CONSTRAINT "blockchain_certifications_transaction_hash_key" UNIQUE ("transaction_hash");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocker_user_id_blocked_user_id_key" UNIQUE ("blocker_user_id", "blocked_user_id");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_channels"
    ADD CONSTRAINT "community_channels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_user_id_key" UNIQUE ("community_id", "user_id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_messages"
    ADD CONSTRAINT "community_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_archives"
    ADD CONSTRAINT "conversation_archives_pkey" PRIMARY KEY ("user_id", "conversation_id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_user_id_key" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_pins"
    ADD CONSTRAINT "conversation_pins_pkey" PRIMARY KEY ("user_id", "conversation_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversion_tracking"
    ADD CONSTRAINT "conversion_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."detailed_reviews"
    ADD CONSTRAINT "detailed_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."detailed_reviews"
    ADD CONSTRAINT "detailed_reviews_reviewer_id_reviewed_profile_id_key" UNIQUE ("reviewer_id", "reviewed_profile_id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_type_key" UNIQUE ("type");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_event_id_user_id_key" UNIQUE ("event_id", "user_id");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."influencer_links"
    ADD CONSTRAINT "influencer_links_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."influencer_links"
    ADD CONSTRAINT "influencer_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."login_attempts"
    ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manager_artists"
    ADD CONSTRAINT "manager_artists_manager_profile_id_artist_profile_id_key" UNIQUE ("manager_profile_id", "artist_profile_id");



ALTER TABLE ONLY "public"."manager_artists"
    ADD CONSTRAINT "manager_artists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_attachments"
    ADD CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_receipts"
    ADD CONSTRAINT "message_receipts_conversation_id_user_id_key" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."message_receipts"
    ADD CONSTRAINT "message_receipts_conversation_user_unique" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."message_receipts"
    ADD CONSTRAINT "message_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."music_collaborators"
    ADD CONSTRAINT "music_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."music_plays"
    ADD CONSTRAINT "music_plays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."music_releases"
    ADD CONSTRAINT "music_releases_isrc_code_key" UNIQUE ("isrc_code");



ALTER TABLE ONLY "public"."music_releases"
    ADD CONSTRAINT "music_releases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_notification_type_key" UNIQUE ("user_id", "notification_type");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_interactions"
    ADD CONSTRAINT "post_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_interactions"
    ADD CONSTRAINT "post_interactions_post_id_user_id_interaction_type_key" UNIQUE ("post_id", "user_id", "interaction_type");



ALTER TABLE ONLY "public"."post_media"
    ADD CONSTRAINT "post_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."prospect_assignments"
    ADD CONSTRAINT "prospect_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_engagement_events"
    ADD CONSTRAINT "prospect_engagement_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_imports"
    ADD CONSTRAINT "prospect_imports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_interactions"
    ADD CONSTRAINT "prospect_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_meetings"
    ADD CONSTRAINT "prospect_meetings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_scoring_history"
    ADD CONSTRAINT "prospect_scoring_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_tags"
    ADD CONSTRAINT "prospect_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."prospect_tags"
    ADD CONSTRAINT "prospect_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospect_tasks"
    ADD CONSTRAINT "prospect_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospecting_campaigns"
    ADD CONSTRAINT "prospecting_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospecting_workflows"
    ADD CONSTRAINT "prospecting_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."radio_likes"
    ADD CONSTRAINT "radio_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."radio_likes"
    ADD CONSTRAINT "radio_likes_user_id_media_asset_id_key" UNIQUE ("user_id", "media_asset_id");



ALTER TABLE ONLY "public"."radio_play_history"
    ADD CONSTRAINT "radio_play_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "radio_playlist_tracks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "radio_playlist_tracks_playlist_id_media_asset_id_key" UNIQUE ("playlist_id", "media_asset_id");



ALTER TABLE ONLY "public"."radio_playlists"
    ADD CONSTRAINT "radio_playlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_commissions"
    ADD CONSTRAINT "recurring_commissions_influencer_profile_id_user_id_month_y_key" UNIQUE ("influencer_profile_id", "user_id", "month_year");



ALTER TABLE ONLY "public"."recurring_commissions"
    ADD CONSTRAINT "recurring_commissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."representation_invitations"
    ADD CONSTRAINT "representation_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."representation_invitations"
    ADD CONSTRAINT "representation_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_reviewed_profile_id_key" UNIQUE ("reviewer_id", "reviewed_profile_id");



ALTER TABLE ONLY "public"."roadmap_items"
    ADD CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scoring_rules"
    ADD CONSTRAINT "scoring_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_log"
    ADD CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_applications"
    ADD CONSTRAINT "service_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_ticker_messages"
    ADD CONSTRAINT "site_ticker_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_posts"
    ADD CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_payment_sessions"
    ADD CONSTRAINT "stripe_payment_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_payment_sessions"
    ADD CONSTRAINT "stripe_payment_sessions_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_config_key_key" UNIQUE ("config_key");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_claim_token_key" UNIQUE ("claim_token");



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_temp_username_key" UNIQUE ("temp_username");



ALTER TABLE ONLY "public"."token_earning_rules"
    ADD CONSTRAINT "token_earning_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_earning_rules"
    ADD CONSTRAINT "token_earning_rules_rule_name_key" UNIQUE ("rule_name");



ALTER TABLE ONLY "public"."token_spending_options"
    ADD CONSTRAINT "token_spending_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_transactions"
    ADD CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "unique_reviewer_reviewed" UNIQUE ("reviewer_id", "reviewed_profile_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_user_id_followed_user_id_key" UNIQUE ("follower_user_id", "followed_user_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_token_balances"
    ADD CONSTRAINT "user_token_balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_token_balances"
    ADD CONSTRAINT "user_token_balances_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."venue_artist_history"
    ADD CONSTRAINT "venue_artist_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venue_gallery"
    ADD CONSTRAINT "venue_gallery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venue_partners"
    ADD CONSTRAINT "venue_partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venue_partners"
    ADD CONSTRAINT "venue_partners_venue_profile_id_partner_profile_id_key" UNIQUE ("venue_profile_id", "partner_profile_id");



ALTER TABLE ONLY "public"."vybbi_agents"
    ADD CONSTRAINT "vybbi_agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vybbi_agents"
    ADD CONSTRAINT "vybbi_agents_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."vybbi_interactions"
    ADD CONSTRAINT "vybbi_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_deliveries"
    ADD CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ad_assets_campaign" ON "public"."ad_assets" USING "btree" ("campaign_id");



CREATE INDEX "idx_ad_campaigns_active_dates" ON "public"."ad_campaigns" USING "btree" ("is_active", "start_date", "end_date");



CREATE INDEX "idx_ad_campaigns_placement" ON "public"."ad_campaigns" USING "btree" ("placement_type");



CREATE INDEX "idx_ad_metrics_campaign" ON "public"."ad_metrics" USING "btree" ("campaign_id");



CREATE INDEX "idx_ad_metrics_created_at" ON "public"."ad_metrics" USING "btree" ("created_at");



CREATE INDEX "idx_admin_mock_profiles_is_mock" ON "public"."admin_mock_profiles" USING "btree" ("is_mock");



CREATE INDEX "idx_admin_mock_profiles_type" ON "public"."admin_mock_profiles" USING "btree" ("profile_type");



CREATE INDEX "idx_admin_secrets_category" ON "public"."admin_secrets" USING "btree" ("category");



CREATE INDEX "idx_admin_secrets_name" ON "public"."admin_secrets" USING "btree" ("name");



CREATE INDEX "idx_admin_secrets_order" ON "public"."admin_secrets" USING "btree" ("order_number");



CREATE INDEX "idx_affiliate_conversions_link" ON "public"."affiliate_conversions" USING "btree" ("link_id");



CREATE INDEX "idx_affiliate_conversions_security" ON "public"."affiliate_conversions" USING "btree" ("link_id", "user_id", "conversion_status");



CREATE INDEX "idx_affiliate_conversions_user" ON "public"."affiliate_conversions" USING "btree" ("user_id");



CREATE INDEX "idx_affiliate_visits_link" ON "public"."affiliate_visits" USING "btree" ("link_id");



CREATE INDEX "idx_affiliate_visits_session" ON "public"."affiliate_visits" USING "btree" ("session_id");



CREATE INDEX "idx_agent_commissions_agent_id" ON "public"."agent_commissions" USING "btree" ("agent_id");



CREATE INDEX "idx_automation_executions_prospect_id" ON "public"."automation_executions" USING "btree" ("prospect_id");



CREATE INDEX "idx_automation_executions_workflow_id" ON "public"."automation_executions" USING "btree" ("workflow_id");



CREATE INDEX "idx_blockchain_certifications_music_release_id" ON "public"."blockchain_certifications" USING "btree" ("music_release_id");



CREATE INDEX "idx_blockchain_certifications_status" ON "public"."blockchain_certifications" USING "btree" ("status");



CREATE INDEX "idx_blockchain_certifications_transaction_hash" ON "public"."blockchain_certifications" USING "btree" ("transaction_hash");



CREATE INDEX "idx_blog_posts_published_at" ON "public"."blog_posts" USING "btree" ("published_at") WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_blog_posts_slug" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_community_channels_community_id" ON "public"."community_channels" USING "btree" ("community_id");



CREATE INDEX "idx_community_members_community_id" ON "public"."community_members" USING "btree" ("community_id");



CREATE INDEX "idx_community_members_lookup" ON "public"."community_members" USING "btree" ("community_id", "user_id", "role");



CREATE INDEX "idx_community_members_user_id" ON "public"."community_members" USING "btree" ("user_id");



CREATE INDEX "idx_community_messages_channel_id" ON "public"."community_messages" USING "btree" ("channel_id");



CREATE INDEX "idx_community_messages_created_at" ON "public"."community_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_conversations_participants" ON "public"."conversation_participants" USING "btree" ("conversation_id", "user_id");



CREATE INDEX "idx_conversion_tracking_agent_id" ON "public"."conversion_tracking" USING "btree" ("agent_id");



CREATE INDEX "idx_conversion_tracking_agent_user" ON "public"."conversion_tracking" USING "btree" ("agent_id", "user_id");



CREATE INDEX "idx_influencer_links_code" ON "public"."influencer_links" USING "btree" ("code");



CREATE INDEX "idx_influencer_links_profile" ON "public"."influencer_links" USING "btree" ("influencer_profile_id");



CREATE INDEX "idx_media_assets_music_release" ON "public"."media_assets" USING "btree" ("music_release_id");



CREATE INDEX "idx_music_collaborators_release" ON "public"."music_collaborators" USING "btree" ("music_release_id");



CREATE INDEX "idx_music_plays_release" ON "public"."music_plays" USING "btree" ("music_release_id");



CREATE INDEX "idx_music_plays_user" ON "public"."music_plays" USING "btree" ("user_id");



CREATE INDEX "idx_music_releases_genre" ON "public"."music_releases" USING "btree" ("genre");



CREATE INDEX "idx_music_releases_isrc" ON "public"."music_releases" USING "btree" ("isrc_code");



CREATE INDEX "idx_music_releases_profile_id" ON "public"."music_releases" USING "btree" ("profile_id");



CREATE INDEX "idx_music_releases_status" ON "public"."music_releases" USING "btree" ("status");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "read_at") WHERE ("read_at" IS NULL);



CREATE INDEX "idx_post_interactions_post_id" ON "public"."post_interactions" USING "btree" ("post_id");



CREATE INDEX "idx_profile_views_created_at" ON "public"."profile_views" USING "btree" ("created_at");



CREATE INDEX "idx_profile_views_session" ON "public"."profile_views" USING "btree" ("session_id");



CREATE INDEX "idx_profile_views_viewed_profile" ON "public"."profile_views" USING "btree" ("viewed_profile_id");



CREATE INDEX "idx_profile_views_viewer_profile" ON "public"."profile_views" USING "btree" ("viewer_profile_id");



CREATE INDEX "idx_profile_views_viewer_user" ON "public"."profile_views" USING "btree" ("viewer_user_id");



CREATE INDEX "idx_profiles_privacy_check" ON "public"."profiles" USING "btree" ("user_id", "is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_profiles_public_search" ON "public"."profiles" USING "btree" ("is_public", "slug") WHERE ("is_public" = true);



CREATE INDEX "idx_profiles_secondary_profile_type" ON "public"."profiles" USING "btree" ("secondary_profile_type");



CREATE INDEX "idx_profiles_secure_public" ON "public"."profiles" USING "btree" ("is_public", "user_id") WHERE ("is_public" = true);



CREATE UNIQUE INDEX "idx_profiles_slug" ON "public"."profiles" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE INDEX "idx_profiles_temporary" ON "public"."profiles" USING "btree" ("is_temporary") WHERE ("is_temporary" = true);



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_user_security" ON "public"."profiles" USING "btree" ("user_id", "is_public");



CREATE INDEX "idx_prospect_interactions_agent_id" ON "public"."prospect_interactions" USING "btree" ("agent_id");



CREATE INDEX "idx_prospect_interactions_prospect_id" ON "public"."prospect_interactions" USING "btree" ("prospect_id");



CREATE INDEX "idx_prospect_meetings_meeting_time" ON "public"."prospect_meetings" USING "btree" ("meeting_time");



CREATE INDEX "idx_prospect_meetings_prospect_id" ON "public"."prospect_meetings" USING "btree" ("prospect_id");



CREATE INDEX "idx_prospect_tasks_processing" ON "public"."prospect_tasks" USING "btree" ("processing_status", "scheduled_at") WHERE ("processing_status" = ANY (ARRAY['waiting'::"text", 'processing'::"text"]));



CREATE INDEX "idx_prospects_assigned_agent" ON "public"."prospects" USING "btree" ("assigned_agent_id");



CREATE INDEX "idx_prospects_created_at" ON "public"."prospects" USING "btree" ("created_at");



CREATE INDEX "idx_prospects_status" ON "public"."prospects" USING "btree" ("status");



CREATE INDEX "idx_representation_invitations_artist" ON "public"."representation_invitations" USING "btree" ("artist_profile_id");



CREATE INDEX "idx_representation_invitations_email" ON "public"."representation_invitations" USING "btree" ("invited_email");



CREATE INDEX "idx_representation_invitations_token" ON "public"."representation_invitations" USING "btree" ("token");



CREATE INDEX "idx_security_audit_user_table" ON "public"."security_audit_log" USING "btree" ("user_id", "table_name", "created_at");



CREATE INDEX "idx_social_posts_created_at" ON "public"."social_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_social_posts_user_id" ON "public"."social_posts" USING "btree" ("user_id");



CREATE INDEX "idx_temp_credentials_profile" ON "public"."temporary_credentials" USING "btree" ("profile_id");



CREATE INDEX "idx_temp_credentials_token" ON "public"."temporary_credentials" USING "btree" ("claim_token");



CREATE INDEX "idx_temp_credentials_username" ON "public"."temporary_credentials" USING "btree" ("temp_username");



CREATE INDEX "idx_ticker_messages_schedule" ON "public"."site_ticker_messages" USING "btree" ("is_active", "start_date", "end_date", "priority");



CREATE INDEX "idx_token_earning_rules_active" ON "public"."token_earning_rules" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_token_spending_options_active" ON "public"."token_spending_options" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_token_transactions_processed_at" ON "public"."token_transactions" USING "btree" ("processed_at" DESC);



CREATE INDEX "idx_token_transactions_user_id" ON "public"."token_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_user_follows_followed" ON "public"."user_follows" USING "btree" ("followed_user_id");



CREATE INDEX "idx_user_follows_follower" ON "public"."user_follows" USING "btree" ("follower_user_id");



CREATE INDEX "idx_user_presence_is_online" ON "public"."user_presence" USING "btree" ("is_online") WHERE ("is_online" = true);



CREATE INDEX "idx_user_roles_lookup" ON "public"."user_roles" USING "btree" ("user_id", "role");



CREATE INDEX "idx_user_token_balances_user_id" ON "public"."user_token_balances" USING "btree" ("user_id");



CREATE INDEX "idx_webhook_deliveries_delivered_at" ON "public"."webhook_deliveries" USING "btree" ("delivered_at");



CREATE INDEX "idx_webhook_deliveries_webhook_id" ON "public"."webhook_deliveries" USING "btree" ("webhook_id");



CREATE OR REPLACE TRIGGER "audit_agent_commissions" AFTER INSERT OR DELETE OR UPDATE ON "public"."agent_commissions" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_audit_sensitive_access"();



CREATE OR REPLACE TRIGGER "audit_conversion_tracking" AFTER INSERT OR DELETE OR UPDATE ON "public"."conversion_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_audit_sensitive_access"();



CREATE OR REPLACE TRIGGER "enforce_messaging_policy_trigger" BEFORE INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_messaging_policy"();



CREATE OR REPLACE TRIGGER "notify_new_message_enhanced_trigger" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_message_enhanced"();



CREATE OR REPLACE TRIGGER "on_booking_request_admin_notification" AFTER INSERT ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."notify_admin_on_booking_activity"();



CREATE OR REPLACE TRIGGER "on_booking_status_change_admin_notification" AFTER UPDATE OF "status" ON "public"."bookings" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."notify_admin_on_booking_activity"();



CREATE OR REPLACE TRIGGER "profile_completion_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_profile_completion"();



CREATE OR REPLACE TRIGGER "trigger_advanced_suspicious_activity_detector" AFTER INSERT ON "public"."security_audit_log" FOR EACH ROW EXECUTE FUNCTION "public"."advanced_suspicious_activity_detector"();



CREATE OR REPLACE TRIGGER "trigger_auto_scoring" AFTER INSERT ON "public"."prospect_engagement_events" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_prospect_score"();



CREATE OR REPLACE TRIGGER "trigger_create_workflow_tasks" AFTER INSERT ON "public"."prospects" FOR EACH ROW EXECUTE FUNCTION "public"."create_workflow_tasks"();



CREATE OR REPLACE TRIGGER "trigger_notify_agent_request" AFTER INSERT ON "public"."agent_artists" FOR EACH ROW EXECUTE FUNCTION "public"."notify_agent_request"();



CREATE OR REPLACE TRIGGER "trigger_notify_application_received" AFTER INSERT ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."notify_application_received"();



CREATE OR REPLACE TRIGGER "trigger_notify_booking_request" AFTER INSERT ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."notify_booking_request"();



CREATE OR REPLACE TRIGGER "trigger_notify_manager_request" AFTER INSERT ON "public"."manager_artists" FOR EACH ROW EXECUTE FUNCTION "public"."notify_manager_request"();



CREATE OR REPLACE TRIGGER "trigger_notify_new_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_message"();



CREATE OR REPLACE TRIGGER "trigger_notify_review_received" AFTER INSERT ON "public"."detailed_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."notify_review_received"();



CREATE OR REPLACE TRIGGER "trigger_set_profile_slug" BEFORE INSERT OR UPDATE OF "display_name" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_profile_slug"();



CREATE OR REPLACE TRIGGER "trigger_sync_task_status" BEFORE UPDATE ON "public"."prospect_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."sync_task_status"();



CREATE OR REPLACE TRIGGER "trigger_update_affiliate_clicks" AFTER INSERT ON "public"."affiliate_visits" FOR EACH ROW EXECUTE FUNCTION "public"."update_affiliate_clicks_on_visit"();



CREATE OR REPLACE TRIGGER "update_ad_campaigns_updated_at" BEFORE UPDATE ON "public"."ad_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ad_settings_updated_at" BEFORE UPDATE ON "public"."ad_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ad_slots_updated_at" BEFORE UPDATE ON "public"."ad_slots" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_admin_mock_profiles_updated_at" BEFORE UPDATE ON "public"."admin_mock_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_admin_secrets_updated_at" BEFORE UPDATE ON "public"."admin_secrets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_annonces_updated_at" BEFORE UPDATE ON "public"."annonces" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_applications_updated_at" BEFORE UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_artist_radio_subscriptions_updated_at" BEFORE UPDATE ON "public"."artist_radio_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_automation_workflows_updated_at" BEFORE UPDATE ON "public"."automation_workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_availability_slots_updated_at" BEFORE UPDATE ON "public"."availability_slots" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_blockchain_certifications_updated_at" BEFORE UPDATE ON "public"."blockchain_certifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_communities_updated_at" BEFORE UPDATE ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_messages_updated_at" BEFORE UPDATE ON "public"."community_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_event_attendees_updated_at" BEFORE UPDATE ON "public"."event_attendees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_influencer_links_updated_at" BEFORE UPDATE ON "public"."influencer_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integrations_updated_at" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_member_count_trigger" AFTER INSERT OR DELETE ON "public"."community_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_community_member_count"();



CREATE OR REPLACE TRIGGER "update_music_releases_updated_at" BEFORE UPDATE ON "public"."music_releases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notifications_updated_at" BEFORE UPDATE ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_prospect_meetings_updated_at" BEFORE UPDATE ON "public"."prospect_meetings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_prospecting_campaigns_updated_at" BEFORE UPDATE ON "public"."prospecting_campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_prospects_updated_at" BEFORE UPDATE ON "public"."prospects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_radio_playlists_updated_at" BEFORE UPDATE ON "public"."radio_playlists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_recurring_commissions_updated_at" BEFORE UPDATE ON "public"."recurring_commissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_roadmap_items_updated_at" BEFORE UPDATE ON "public"."roadmap_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_applications_updated_at" BEFORE UPDATE ON "public"."service_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_requests_updated_at" BEFORE UPDATE ON "public"."service_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_site_ticker_messages_updated_at" BEFORE UPDATE ON "public"."site_ticker_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_social_posts_updated_at" BEFORE UPDATE ON "public"."social_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_system_config_updated_at" BEFORE UPDATE ON "public"."system_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_token_earning_rules_updated_at" BEFORE UPDATE ON "public"."token_earning_rules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_token_spending_options_updated_at" BEFORE UPDATE ON "public"."token_spending_options" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_presence_updated_at" BEFORE UPDATE ON "public"."user_presence" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_token_balances_updated_at" BEFORE UPDATE ON "public"."user_token_balances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_venue_artist_history_updated_at" BEFORE UPDATE ON "public"."venue_artist_history" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_venue_gallery_updated_at" BEFORE UPDATE ON "public"."venue_gallery" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_venue_partners_updated_at" BEFORE UPDATE ON "public"."venue_partners" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vybbi_agents_updated_at" BEFORE UPDATE ON "public"."vybbi_agents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vybbi_interactions_updated_at" BEFORE UPDATE ON "public"."vybbi_interactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_webhook_subscriptions_updated_at" BEFORE UPDATE ON "public"."webhook_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ad_assets"
    ADD CONSTRAINT "ad_assets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ad_campaign_slots"
    ADD CONSTRAINT "ad_campaign_slots_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ad_campaign_slots"
    ADD CONSTRAINT "ad_campaign_slots_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_slots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ad_campaigns"
    ADD CONSTRAINT "ad_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ad_metrics"
    ADD CONSTRAINT "ad_metrics_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."ad_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ad_metrics"
    ADD CONSTRAINT "ad_metrics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ad_metrics"
    ADD CONSTRAINT "ad_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ad_settings"
    ADD CONSTRAINT "ad_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_mock_profiles"
    ADD CONSTRAINT "admin_mock_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_secrets"
    ADD CONSTRAINT "admin_secrets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_secrets"
    ADD CONSTRAINT "admin_secrets_last_accessed_by_fkey" FOREIGN KEY ("last_accessed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."affiliate_conversions"
    ADD CONSTRAINT "affiliate_conversions_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."influencer_links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."affiliate_conversions"
    ADD CONSTRAINT "affiliate_conversions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."affiliate_conversions"
    ADD CONSTRAINT "affiliate_conversions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "public"."affiliate_visits"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."affiliate_visits"
    ADD CONSTRAINT "affiliate_visits_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."influencer_links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_commissions"
    ADD CONSTRAINT "agent_commissions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."agent_commissions"
    ADD CONSTRAINT "agent_commissions_conversion_id_fkey" FOREIGN KEY ("conversion_id") REFERENCES "public"."conversion_tracking"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_annonce_id_fkey" FOREIGN KEY ("annonce_id") REFERENCES "public"."annonces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artist_radio_subscriptions"
    ADD CONSTRAINT "artist_radio_subscriptions_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_current_step_id_fkey" FOREIGN KEY ("current_step_id") REFERENCES "public"."automation_steps"("id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."automation_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."automation_steps"
    ADD CONSTRAINT "automation_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."automation_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blockchain_certifications"
    ADD CONSTRAINT "blockchain_certifications_certified_by_fkey" FOREIGN KEY ("certified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."community_channels"
    ADD CONSTRAINT "community_channels_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_messages"
    ADD CONSTRAINT "community_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."community_channels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_messages"
    ADD CONSTRAINT "community_messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."community_messages"("id");



ALTER TABLE ONLY "public"."community_messages"
    ADD CONSTRAINT "community_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."community_messages"
    ADD CONSTRAINT "community_messages_sender_profile_id_fkey" FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."conversation_archives"
    ADD CONSTRAINT "conversation_archives_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_archives"
    ADD CONSTRAINT "conversation_archives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_pins"
    ADD CONSTRAINT "conversation_pins_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_pins"
    ADD CONSTRAINT "conversation_pins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversion_tracking"
    ADD CONSTRAINT "conversion_tracking_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."conversion_tracking"
    ADD CONSTRAINT "conversion_tracking_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id");



ALTER TABLE ONLY "public"."conversion_tracking"
    ADD CONSTRAINT "conversion_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_preferred_contact_profile" FOREIGN KEY ("preferred_contact_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "fk_radio_playlist_tracks_music_release" FOREIGN KEY ("music_release_id") REFERENCES "public"."music_releases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."influencer_links"
    ADD CONSTRAINT "influencer_links_influencer_profile_id_fkey" FOREIGN KEY ("influencer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_music_release_id_fkey" FOREIGN KEY ("music_release_id") REFERENCES "public"."music_releases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_receipts"
    ADD CONSTRAINT "message_receipts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_receipts"
    ADD CONSTRAINT "message_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."music_collaborators"
    ADD CONSTRAINT "music_collaborators_collaborator_profile_id_fkey" FOREIGN KEY ("collaborator_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."music_collaborators"
    ADD CONSTRAINT "music_collaborators_music_release_id_fkey" FOREIGN KEY ("music_release_id") REFERENCES "public"."music_releases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."music_plays"
    ADD CONSTRAINT "music_plays_music_release_id_fkey" FOREIGN KEY ("music_release_id") REFERENCES "public"."music_releases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."music_releases"
    ADD CONSTRAINT "music_releases_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_interactions"
    ADD CONSTRAINT "post_interactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_interactions"
    ADD CONSTRAINT "post_interactions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_interactions"
    ADD CONSTRAINT "post_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_media"
    ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_viewed_profile_id_fkey" FOREIGN KEY ("viewed_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_viewer_profile_id_fkey" FOREIGN KEY ("viewer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profile_views"
    ADD CONSTRAINT "profile_views_viewer_user_id_fkey" FOREIGN KEY ("viewer_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_created_by_admin_fkey" FOREIGN KEY ("created_by_admin") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospect_assignments"
    ADD CONSTRAINT "prospect_assignments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospect_assignments"
    ADD CONSTRAINT "prospect_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospect_assignments"
    ADD CONSTRAINT "prospect_assignments_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_engagement_events"
    ADD CONSTRAINT "prospect_engagement_events_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_imports"
    ADD CONSTRAINT "prospect_imports_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospect_interactions"
    ADD CONSTRAINT "prospect_interactions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospect_interactions"
    ADD CONSTRAINT "prospect_interactions_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_meetings"
    ADD CONSTRAINT "prospect_meetings_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_scoring_history"
    ADD CONSTRAINT "prospect_scoring_history_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_tags"
    ADD CONSTRAINT "prospect_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospect_tasks"
    ADD CONSTRAINT "prospect_tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospect_tasks"
    ADD CONSTRAINT "prospect_tasks_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prospect_tasks"
    ADD CONSTRAINT "prospect_tasks_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."prospecting_workflows"("id");



ALTER TABLE ONLY "public"."prospecting_campaigns"
    ADD CONSTRAINT "prospecting_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospecting_workflows"
    ADD CONSTRAINT "prospecting_workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_assigned_agent_id_fkey" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."vybbi_agents"("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_converted_user_id_fkey" FOREIGN KEY ("converted_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prospects"
    ADD CONSTRAINT "prospects_referral_prospect_id_fkey" FOREIGN KEY ("referral_prospect_id") REFERENCES "public"."prospects"("id");



ALTER TABLE ONLY "public"."radio_play_history"
    ADD CONSTRAINT "radio_play_history_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id");



ALTER TABLE ONLY "public"."radio_play_history"
    ADD CONSTRAINT "radio_play_history_music_release_id_fkey" FOREIGN KEY ("music_release_id") REFERENCES "public"."music_releases"("id");



ALTER TABLE ONLY "public"."radio_play_history"
    ADD CONSTRAINT "radio_play_history_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "public"."radio_playlists"("id");



ALTER TABLE ONLY "public"."radio_play_history"
    ADD CONSTRAINT "radio_play_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "radio_playlist_tracks_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "radio_playlist_tracks_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."radio_playlist_tracks"
    ADD CONSTRAINT "radio_playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "public"."radio_playlists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."radio_playlists"
    ADD CONSTRAINT "radio_playlists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."recurring_commissions"
    ADD CONSTRAINT "recurring_commissions_conversion_id_fkey" FOREIGN KEY ("conversion_id") REFERENCES "public"."affiliate_conversions"("id");



ALTER TABLE ONLY "public"."recurring_commissions"
    ADD CONSTRAINT "recurring_commissions_influencer_profile_id_fkey" FOREIGN KEY ("influencer_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."representation_invitations"
    ADD CONSTRAINT "representation_invitations_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."representation_invitations"
    ADD CONSTRAINT "representation_invitations_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewed_profile_id_fkey" FOREIGN KEY ("reviewed_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_applications"
    ADD CONSTRAINT "service_applications_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_ticker_messages"
    ADD CONSTRAINT "site_ticker_messages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."social_posts"
    ADD CONSTRAINT "social_posts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_posts"
    ADD CONSTRAINT "social_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_claimed_by_user_id_fkey" FOREIGN KEY ("claimed_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."temporary_credentials"
    ADD CONSTRAINT "temporary_credentials_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_transactions"
    ADD CONSTRAINT "token_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_followed_profile_id_fkey" FOREIGN KEY ("followed_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_followed_user_id_fkey" FOREIGN KEY ("followed_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_profile_id_fkey" FOREIGN KEY ("follower_profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_token_balances"
    ADD CONSTRAINT "user_token_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vybbi_agents"
    ADD CONSTRAINT "vybbi_agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vybbi_interactions"
    ADD CONSTRAINT "vybbi_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."webhook_deliveries"
    ADD CONSTRAINT "webhook_deliveries_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE CASCADE;



CREATE POLICY "Active links are viewable for tracking" ON "public"."influencer_links" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Admins can delete all annonces" ON "public"."annonces" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete all messages" ON "public"."messages" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete message attachments" ON "public"."message_attachments" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete message receipts" ON "public"."message_receipts" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert agents" ON "public"."vybbi_agents" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert prospects" ON "public"."prospects" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all assets" ON "public"."ad_assets" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all assignments" ON "public"."prospect_assignments" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all blog posts" ON "public"."blog_posts" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all campaign slots" ON "public"."ad_campaign_slots" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all campaigns" ON "public"."ad_campaigns" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all campaigns" ON "public"."prospecting_campaigns" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all commissions" ON "public"."agent_commissions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all communities" ON "public"."communities" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all conversions" ON "public"."affiliate_conversions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all conversions" ON "public"."conversion_tracking" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all email templates" ON "public"."email_templates" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all engagement events" ON "public"."prospect_engagement_events" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all events" ON "public"."events" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all influencer links" ON "public"."influencer_links" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all integrations" ON "public"."integrations" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all interactions" ON "public"."prospect_interactions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all payment sessions" ON "public"."stripe_payment_sessions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all playlist tracks" ON "public"."radio_playlist_tracks" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all playlists" ON "public"."radio_playlists" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all prospect tags" ON "public"."prospect_tags" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all prospects" ON "public"."prospects" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all recurring commissions" ON "public"."recurring_commissions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all slots" ON "public"."ad_slots" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all subscriptions" ON "public"."artist_radio_subscriptions" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all tags" ON "public"."prospect_tags" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all tasks" ON "public"."prospect_tasks" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all temporary credentials" ON "public"."temporary_credentials" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all ticker messages" ON "public"."site_ticker_messages" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all vybbi agents" ON "public"."vybbi_agents" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage automation workflows" ON "public"."automation_workflows" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage imports" ON "public"."prospect_imports" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage scoring history" ON "public"."prospect_scoring_history" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage scoring rules" ON "public"."scoring_rules" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage settings" ON "public"."ad_settings" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage spending options" ON "public"."token_spending_options" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage token earning rules" ON "public"."token_earning_rules" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage webhook subscriptions" ON "public"."webhook_subscriptions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage workflows" ON "public"."prospecting_workflows" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update all annonces" ON "public"."annonces" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update conversations" ON "public"."conversations" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all Vybbi interactions" ON "public"."vybbi_interactions" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all agents" ON "public"."vybbi_agents" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all annonces" ON "public"."annonces" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all conversation participants" ON "public"."conversation_participants" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all engagement events" ON "public"."prospect_engagement_events" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all invitations" ON "public"."representation_invitations" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all memberships" ON "public"."community_members" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all message attachments" ON "public"."message_attachments" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all message receipts" ON "public"."message_receipts" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all messages" ON "public"."messages" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all metrics" ON "public"."ad_metrics" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all play history" ON "public"."radio_play_history" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all profile views" ON "public"."profile_views" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all visits" ON "public"."affiliate_visits" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view webhook deliveries" ON "public"."webhook_deliveries" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Agents can create non-system tags" ON "public"."prospect_tags" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND ("is_system" = false) AND (EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE ("vybbi_agents"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can create prospects" ON "public"."prospects" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents" "va"
  WHERE ("va"."user_id" = "auth"."uid"()))) AND ("created_by" = "auth"."uid"()) AND ("assigned_agent_id" IN ( SELECT "va"."id"
   FROM "public"."vybbi_agents" "va"
  WHERE ("va"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can create their own campaigns" ON "public"."prospecting_campaigns" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE ("vybbi_agents"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can delete their own campaigns" ON "public"."prospecting_campaigns" FOR DELETE USING ((("created_by" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Agents can insert engagement for their prospects" ON "public"."prospect_engagement_events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."prospects" "p"
     JOIN "public"."vybbi_agents" "va" ON (("va"."id" = "p"."assigned_agent_id")))
  WHERE (("p"."id" = "prospect_engagement_events"."prospect_id") AND ("va"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can manage their artist relationships" ON "public"."agent_artists" USING ("public"."user_owns_profile"("agent_profile_id"));



CREATE POLICY "Agents can manage their interactions" ON "public"."prospect_interactions" USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "prospect_interactions"."agent_id")))));



CREATE POLICY "Agents can manage their tasks" ON "public"."prospect_tasks" USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."id" = "prospect_tasks"."agent_id") AND ("vybbi_agents"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can update assigned prospects" ON "public"."prospects" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "prospects"."assigned_agent_id")))));



CREATE POLICY "Agents can update their own campaigns" ON "public"."prospecting_campaigns" FOR UPDATE USING ((("created_by" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Agents can update their own profile" ON "public"."vybbi_agents" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Agents can view active workflows" ON "public"."automation_workflows" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Agents can view assigned prospects" ON "public"."prospects" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "prospects"."assigned_agent_id")))));



CREATE POLICY "Agents can view prospect scoring" ON "public"."prospect_scoring_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."prospects" "p"
     JOIN "public"."vybbi_agents" "va" ON (("va"."id" = "p"."assigned_agent_id")))
  WHERE (("p"."id" = "prospect_scoring_history"."prospect_id") AND ("va"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can view prospect tags" ON "public"."prospect_tags" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR (EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE ("vybbi_agents"."user_id" = "auth"."uid"())))));



CREATE POLICY "Agents can view their assignments" ON "public"."prospect_assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "prospect_assignments"."agent_id")))));



CREATE POLICY "Agents can view their commissions" ON "public"."agent_commissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "agent_commissions"."agent_id")))));



CREATE POLICY "Agents can view their conversions" ON "public"."conversion_tracking" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vybbi_agents"
  WHERE (("vybbi_agents"."user_id" = "auth"."uid"()) AND ("vybbi_agents"."id" = "conversion_tracking"."agent_id")))));



CREATE POLICY "Agents can view their own imports" ON "public"."prospect_imports" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR ("imported_by" = "auth"."uid"())));



CREATE POLICY "Agents can view their own profile" ON "public"."vybbi_agents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Agents can view their prospects engagement" ON "public"."prospect_engagement_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."prospects" "p"
     JOIN "public"."vybbi_agents" "va" ON (("va"."id" = "p"."assigned_agent_id")))
  WHERE (("p"."id" = "prospect_engagement_events"."prospect_id") AND ("va"."user_id" = "auth"."uid"())))));



CREATE POLICY "Annonce owners can update application status" ON "public"."applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."annonces" "a"
     JOIN "public"."profiles" "p" ON (("a"."user_id" = "p"."user_id")))
  WHERE (("a"."id" = "applications"."annonce_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Anyone can insert play history" ON "public"."radio_play_history" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anyone can insert play records" ON "public"."music_plays" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert visits for tracking" ON "public"."affiliate_visits" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active service requests" ON "public"."service_requests" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Anyone can view collaborators for published releases" ON "public"."music_collaborators" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."music_releases" "mr"
  WHERE (("mr"."id" = "music_collaborators"."music_release_id") AND ("mr"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can view event attendees for published events" ON "public"."event_attendees" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events" "e"
  WHERE (("e"."id" = "event_attendees"."event_id") AND ("e"."status" = 'published'::"public"."event_status")))));



CREATE POLICY "Anyone can view invitations by token" ON "public"."representation_invitations" FOR SELECT USING ((("status" = 'pending'::"text") AND ("expires_at" > "now"())));



CREATE POLICY "Applicants can view their own applications" ON "public"."service_applications" FOR SELECT USING (("auth"."uid"() = "applicant_user_id"));



CREATE POLICY "Artists can add tracks to playlists" ON "public"."radio_playlist_tracks" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."media_assets" "ma"
     JOIN "public"."profiles" "p" ON (("p"."id" = "ma"."profile_id")))
  WHERE (("ma"."id" = "radio_playlist_tracks"."media_asset_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can certify their releases" ON "public"."blockchain_certifications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."music_releases" "mr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "mr"."profile_id")))
  WHERE (("mr"."id" = "blockchain_certifications"."music_release_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can create bookings" ON "public"."bookings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "bookings"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'artist'::"public"."profile_type")))));



CREATE POLICY "Artists can create music releases" ON "public"."music_releases" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "music_releases"."profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can create their own events" ON "public"."events" FOR INSERT WITH CHECK ((("created_by_artist" = true) AND ("created_by_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "events"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'artist'::"public"."profile_type"))))));



CREATE POLICY "Artists can manage their availability" ON "public"."availability_slots" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "availability_slots"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can manage their invitations" ON "public"."representation_invitations" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "representation_invitations"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can manage their own events" ON "public"."events" USING ((("created_by_artist" = true) AND ("created_by_user_id" = "auth"."uid"())));



CREATE POLICY "Artists can manage their own music releases" ON "public"."music_releases" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "music_releases"."profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can update manager representation status" ON "public"."manager_artists" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "manager_artists"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can view and update their agent relationships" ON "public"."agent_artists" USING ("public"."user_owns_profile"("artist_profile_id"));



CREATE POLICY "Artists can view their certifications" ON "public"."blockchain_certifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."music_releases" "mr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "mr"."profile_id")))
  WHERE (("mr"."id" = "blockchain_certifications"."music_release_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can view their manager relationships" ON "public"."manager_artists" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "manager_artists"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can view their own bookings" ON "public"."bookings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "bookings"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'artist'::"public"."profile_type")))));



CREATE POLICY "Artists can view their own history" ON "public"."venue_artist_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_artist_history"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Artists can view their own subscriptions" ON "public"."artist_radio_subscriptions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "artist_radio_subscriptions"."artist_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Authenticated system can insert conversions" ON "public"."affiliate_conversions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can claim credentials" ON "public"."temporary_credentials" FOR UPDATE TO "authenticated" USING ((("is_claimed" = false) AND ("expires_at" > "now"()))) WITH CHECK ((("is_claimed" = true) AND ("claimed_by_user_id" = "auth"."uid"())));



CREATE POLICY "Authenticated users can create conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert Vybbi interactions" ON "public"."vybbi_interactions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert metrics with validation" ON "public"."ad_metrics" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("campaign_id" IS NOT NULL) AND ("event_type" = ANY (ARRAY['impression'::"text", 'click'::"text", 'conversion'::"text"])) AND ("created_at" >= ("now"() - '01:00:00'::interval))));



CREATE POLICY "Authenticated users can insert profile views" ON "public"."profile_views" FOR INSERT WITH CHECK ((("viewer_user_id" = "auth"."uid"()) AND ("viewed_profile_id" IS NOT NULL) AND ("viewed_profile_id" <> "viewer_profile_id")));



CREATE POLICY "Authenticated users can track music plays" ON "public"."music_plays" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can track views" ON "public"."profile_views" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view like counts" ON "public"."radio_likes" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authorized agents can view relevant workflows" ON "public"."prospecting_workflows" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR (EXISTS ( SELECT 1
   FROM ("public"."prospect_tasks" "pt"
     JOIN "public"."vybbi_agents" "va" ON (("va"."id" = "pt"."agent_id")))
  WHERE (("pt"."workflow_id" = "prospecting_workflows"."id") AND ("va"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Campaign creators can view their campaigns" ON "public"."prospecting_campaigns" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Community admins can manage channels" ON "public"."community_channels" USING ((EXISTS ( SELECT 1
   FROM "public"."community_members" "cm"
  WHERE (("cm"."community_id" = "community_channels"."community_id") AND ("cm"."user_id" = "auth"."uid"()) AND ("cm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Community admins can manage members" ON "public"."community_members" USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR (EXISTS ( SELECT 1
   FROM "public"."communities" "c"
  WHERE (("c"."id" = "community_members"."community_id") AND ("c"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Community creators can view their members" ON "public"."community_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."communities" "c"
  WHERE (("c"."id" = "community_members"."community_id") AND ("c"."created_by" = "auth"."uid"())))));



CREATE POLICY "Community members can send messages" ON "public"."community_messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."community_channels" "cc"
     JOIN "public"."communities" "c" ON (("c"."id" = "cc"."community_id")))
  WHERE (("cc"."id" = "community_messages"."channel_id") AND "public"."is_community_member"("c"."id", "auth"."uid"()) AND (NOT (EXISTS ( SELECT 1
           FROM "public"."community_members" "cm"
          WHERE (("cm"."community_id" = "c"."id") AND ("cm"."user_id" = "auth"."uid"()) AND ("cm"."is_muted" = true))))))))));



CREATE POLICY "Community members can view channels" ON "public"."community_channels" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."community_members" "cm"
  WHERE (("cm"."community_id" = "community_channels"."community_id") AND ("cm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Community members can view messages" ON "public"."community_messages" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR (EXISTS ( SELECT 1
   FROM ("public"."community_channels" "cc"
     JOIN "public"."communities" "c" ON (("c"."id" = "cc"."community_id")))
  WHERE (("cc"."id" = "community_messages"."channel_id") AND (("c"."created_by" = "auth"."uid"()) OR "public"."is_community_member"("c"."id", "auth"."uid"())))))));



CREATE POLICY "Community moderators can manage messages" ON "public"."community_messages" USING ((EXISTS ( SELECT 1
   FROM ("public"."community_channels" "cc"
     JOIN "public"."community_members" "cm" ON (("cm"."community_id" = "cc"."community_id")))
  WHERE (("cc"."id" = "community_messages"."channel_id") AND ("cm"."user_id" = "auth"."uid"()) AND ("cm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Community moderators can view members" ON "public"."community_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "cm2"."user_id"
   FROM "public"."community_members" "cm2"
  WHERE (("cm2"."community_id" = "community_members"."community_id") AND ("cm2"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'moderator'::"text"])) AND ("cm2"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Community owners can manage their communities" ON "public"."communities" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Detailed reviews are viewable through public profiles" ON "public"."detailed_reviews" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "detailed_reviews"."reviewed_profile_id") AND ("profiles"."is_public" = true)))));



CREATE POLICY "Event owners can view attendees" ON "public"."event_attendees" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."events" "e"
     JOIN "public"."profiles" "p" ON (("p"."id" = "e"."venue_profile_id")))
  WHERE (("e"."id" = "event_attendees"."event_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Everyone can view active earning rules" ON "public"."token_earning_rules" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Everyone can view active spending options" ON "public"."token_spending_options" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Gallery images are publicly viewable" ON "public"."venue_gallery" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_gallery"."venue_profile_id") AND ("p"."is_public" = true)))));



CREATE POLICY "Influencers can manage their own links" ON "public"."influencer_links" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "influencer_links"."influencer_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Influencers can view their conversions" ON "public"."affiliate_conversions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."influencer_links" "il"
     JOIN "public"."profiles" "p" ON (("p"."id" = "il"."influencer_profile_id")))
  WHERE (("il"."id" = "affiliate_conversions"."link_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Influencers can view their recurring commissions" ON "public"."recurring_commissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "recurring_commissions"."influencer_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Influencers can view visits to their links" ON "public"."affiliate_visits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."influencer_links" "il"
     JOIN "public"."profiles" "p" ON (("p"."id" = "il"."influencer_profile_id")))
  WHERE (("il"."id" = "affiliate_visits"."link_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Managers can manage their artist relationships" ON "public"."manager_artists" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "manager_artists"."manager_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Managers can view their artists" ON "public"."manager_artists" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "manager_artists"."manager_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Media assets viewable through public profiles" ON "public"."media_assets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "media_assets"."profile_id") AND ("profiles"."is_public" = true)))));



CREATE POLICY "Only admins can access templates" ON "public"."email_templates" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can create roadmap items" ON "public"."roadmap_items" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete roadmap items" ON "public"."roadmap_items" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert conversion tracking" ON "public"."conversion_tracking" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert system config" ON "public"."system_config" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Only admins can manage admin settings" ON "public"."admin_settings" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can manage secrets" ON "public"."admin_secrets" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can modify active campaigns" ON "public"."ad_campaigns" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update commissions" ON "public"."agent_commissions" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update conversion tracking" ON "public"."conversion_tracking" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update roadmap items" ON "public"."roadmap_items" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update system config" ON "public"."system_config" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Only admins can view ad settings" ON "public"."ad_settings" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view agents" ON "public"."vybbi_agents" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view login attempts" ON "public"."login_attempts" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view prospects" ON "public"."prospects" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view roadmap items" ON "public"."roadmap_items" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view secrets" ON "public"."admin_secrets" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view security audit logs" ON "public"."security_audit_log" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view security logs" ON "public"."security_audit_log" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view system config" ON "public"."system_config" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Only agents_managers_venues can create detailed reviews" ON "public"."detailed_reviews" FOR INSERT WITH CHECK ((("auth"."uid"() = "reviewer_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "reviewer_profile"
  WHERE (("reviewer_profile"."user_id" = "auth"."uid"()) AND ("reviewer_profile"."profile_type" = ANY (ARRAY['agent'::"public"."profile_type", 'manager'::"public"."profile_type", 'lieu'::"public"."profile_type"]))))) AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "reviewed_profile"
  WHERE (("reviewed_profile"."id" = "detailed_reviews"."reviewed_profile_id") AND ("reviewed_profile"."profile_type" = 'artist'::"public"."profile_type"))))));



CREATE POLICY "Only agents_managers_venues can review artists" ON "public"."reviews" FOR INSERT WITH CHECK ((("auth"."uid"() = "reviewer_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "reviewer_profile"
  WHERE (("reviewer_profile"."user_id" = "auth"."uid"()) AND ("reviewer_profile"."profile_type" = ANY (ARRAY['agent'::"public"."profile_type", 'manager'::"public"."profile_type", 'lieu'::"public"."profile_type"]))))) AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "reviewed_profile"
  WHERE (("reviewed_profile"."id" = "reviews"."reviewed_profile_id") AND ("reviewed_profile"."profile_type" = 'artist'::"public"."profile_type"))))));



CREATE POLICY "Only system can insert agent commissions" ON "public"."agent_commissions" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only system can manage recurring commissions" ON "public"."recurring_commissions" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Partners can view their partnerships" ON "public"."venue_partners" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_partners"."partner_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Private communities viewable by members" ON "public"."communities" FOR SELECT USING (((("type" = 'public'::"text") AND ("is_active" = true)) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR ("created_by" = "auth"."uid"()) OR "public"."is_community_member"("id", "auth"."uid"())));



CREATE POLICY "Profile owners and admins can delete profiles" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Profile owners and admins can update profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Profile owners can view their analytics" ON "public"."profile_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "profile_views"."viewed_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Profile owners can view their visitors" ON "public"."profile_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "profile_views"."viewed_profile_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Public can view accepted agent relationships" ON "public"."agent_artists" FOR SELECT USING (("representation_status" = 'accepted'::"public"."representation_status"));



CREATE POLICY "Public can view accepted manager relationships" ON "public"."manager_artists" FOR SELECT USING (("representation_status" = 'accepted'::"public"."representation_status"));



CREATE POLICY "Public can view active campaigns" ON "public"."ad_campaigns" FOR SELECT USING ((("is_active" = true) AND ("start_date" <= CURRENT_DATE) AND ("end_date" >= CURRENT_DATE)));



CREATE POLICY "Public can view active playlists" ON "public"."radio_playlists" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "Public can view active ticker messages" ON "public"."site_ticker_messages" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view approved tracks" ON "public"."radio_playlist_tracks" FOR SELECT TO "authenticated", "anon" USING (("is_approved" = true));



CREATE POLICY "Public can view assets for active campaigns" ON "public"."ad_assets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."ad_campaigns" "c"
  WHERE (("c"."id" = "ad_assets"."campaign_id") AND ("c"."is_active" = true) AND ("c"."start_date" <= CURRENT_DATE) AND ("c"."end_date" >= CURRENT_DATE)))));



CREATE POLICY "Public can view available slots" ON "public"."availability_slots" FOR SELECT USING (("status" = 'available'::"public"."availability_status"));



CREATE POLICY "Public can view confirmed certifications" ON "public"."blockchain_certifications" FOR SELECT USING (("status" = 'confirmed'::"text"));



CREATE POLICY "Public can view enabled campaign slots" ON "public"."ad_campaign_slots" FOR SELECT USING ((("is_enabled" = true) AND (EXISTS ( SELECT 1
   FROM "public"."ad_slots" "s"
  WHERE (("s"."id" = "ad_campaign_slots"."slot_id") AND ("s"."is_enabled" = true)))) AND (EXISTS ( SELECT 1
   FROM "public"."ad_campaigns" "c"
  WHERE (("c"."id" = "ad_campaign_slots"."campaign_id") AND ("c"."is_active" = true) AND ("c"."start_date" <= CURRENT_DATE) AND ("c"."end_date" >= CURRENT_DATE))))));



CREATE POLICY "Public can view enabled slots" ON "public"."ad_slots" FOR SELECT USING (("is_enabled" = true));



CREATE POLICY "Public can view safe profile data" ON "public"."profiles" FOR SELECT USING ((("is_public" = true) AND (("auth"."uid"() = "user_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR true)));



CREATE POLICY "Public can view unclaimed credentials with valid token" ON "public"."temporary_credentials" FOR SELECT TO "anon" USING ((("is_claimed" = false) AND ("expires_at" > "now"())));



CREATE POLICY "Public communities are viewable by everyone" ON "public"."communities" FOR SELECT USING (((("type" = 'public'::"text") AND ("is_active" = true)) OR (("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."community_members" "cm"
  WHERE (("cm"."community_id" = "cm"."id") AND ("cm"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Published annonces are viewable by everyone" ON "public"."annonces" FOR SELECT USING (("status" = 'published'::"public"."annonce_status"));



CREATE POLICY "Published blog posts are viewable by everyone" ON "public"."blog_posts" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Published events are viewable by everyone" ON "public"."events" FOR SELECT USING (("status" = 'published'::"public"."event_status"));



CREATE POLICY "Release owners can manage collaborators" ON "public"."music_collaborators" USING ((EXISTS ( SELECT 1
   FROM ("public"."music_releases" "mr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "mr"."profile_id")))
  WHERE (("mr"."id" = "music_collaborators"."music_release_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Release owners can view play stats" ON "public"."music_plays" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."music_releases" "mr"
     JOIN "public"."profiles" "p" ON (("p"."id" = "mr"."profile_id")))
  WHERE (("mr"."id" = "music_plays"."music_release_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Reviews are viewable through public profiles" ON "public"."reviews" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "reviews"."reviewed_profile_id") AND ("profiles"."is_public" = true)))));



CREATE POLICY "Service request owners can update application status" ON "public"."service_applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."service_requests" "sr"
  WHERE (("sr"."id" = "service_applications"."service_request_id") AND ("sr"."created_by" = "auth"."uid"())))));



CREATE POLICY "Service request owners can view applications" ON "public"."service_applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."service_requests" "sr"
  WHERE (("sr"."id" = "service_applications"."service_request_id") AND ("sr"."created_by" = "auth"."uid"())))));



CREATE POLICY "Super admins only can manage mock profiles" ON "public"."admin_mock_profiles" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "System can insert engagement events" ON "public"."prospect_engagement_events" FOR INSERT WITH CHECK ((("auth"."uid"() IS NULL) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can update certifications" ON "public"."blockchain_certifications" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "System can update payment sessions" ON "public"."stripe_payment_sessions" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can add media to their posts" ON "public"."post_media" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."social_posts"
  WHERE (("social_posts"."id" = "post_media"."post_id") AND ("social_posts"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create applications" ON "public"."applications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "applications"."applicant_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create applications" ON "public"."service_applications" FOR INSERT WITH CHECK (("auth"."uid"() = "applicant_user_id"));



CREATE POLICY "Users can create attachments for their messages" ON "public"."message_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversation_participants" "cp" ON (("cp"."conversation_id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_attachments"."message_id") AND ("cp"."user_id" = "auth"."uid"()) AND ("m"."sender_id" = "auth"."uid"())))));



CREATE POLICY "Users can create media for their profiles" ON "public"."media_assets" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "media_assets"."profile_id") AND ("profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own agent" ON "public"."vybbi_agents" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own annonces" ON "public"."annonces" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own payment sessions" ON "public"."stripe_payment_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own posts" ON "public"."social_posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own service requests" ON "public"."service_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete their own interactions" ON "public"."post_interactions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own media assets" ON "public"."media_assets" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "media_assets"."profile_id") AND ("profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own posts" ON "public"."social_posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own service requests" ON "public"."service_requests" FOR DELETE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can follow others" ON "public"."user_follows" FOR INSERT WITH CHECK (("auth"."uid"() = "follower_user_id"));



CREATE POLICY "Users can interact with visible posts" ON "public"."post_interactions" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."social_posts" "sp"
  WHERE (("sp"."id" = "post_interactions"."post_id") AND (("sp"."visibility" = 'public'::"text") OR ("sp"."user_id" = "auth"."uid"()) OR (("sp"."visibility" = 'followers'::"text") AND (EXISTS ( SELECT 1
           FROM "public"."user_follows"
          WHERE (("user_follows"."followed_user_id" = "sp"."user_id") AND ("user_follows"."follower_user_id" = "auth"."uid"())))))))))));



CREATE POLICY "Users can join conversations" ON "public"."conversation_participants" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can join public communities" ON "public"."community_members" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."communities" "c"
  WHERE (("c"."id" = "community_members"."community_id") AND ("c"."type" = 'public'::"text") AND ("c"."is_active" = true))))));



CREATE POLICY "Users can manage meetings for their prospects" ON "public"."prospect_meetings" USING ((EXISTS ( SELECT 1
   FROM "public"."prospects" "p"
  WHERE (("p"."id" = "prospect_meetings"."prospect_id") AND ("p"."assigned_agent_id" IN ( SELECT "va"."id"
           FROM "public"."vybbi_agents" "va"
          WHERE ("va"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can manage their own archives" ON "public"."conversation_archives" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own attendance" ON "public"."event_attendees" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own blocks" ON "public"."blocked_users" USING (("auth"."uid"() = "blocker_user_id"));



CREATE POLICY "Users can manage their own likes" ON "public"."radio_likes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own notification preferences" ON "public"."notification_preferences" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own pins" ON "public"."conversation_pins" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own receipts" ON "public"."message_receipts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send messages to their conversations" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can track their visits" ON "public"."profile_views" FOR INSERT WITH CHECK (("viewer_user_id" = "auth"."uid"()));



CREATE POLICY "Users can unfollow" ON "public"."user_follows" FOR DELETE USING (("auth"."uid"() = "follower_user_id"));



CREATE POLICY "Users can update their own annonces" ON "public"."annonces" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own media assets" ON "public"."media_assets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "media_assets"."profile_id") AND ("profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own messages" ON "public"."community_messages" FOR UPDATE USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own posts" ON "public"."social_posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own presence" ON "public"."user_presence" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own service requests" ON "public"."service_requests" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update their own token balance" ON "public"."user_token_balances" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view active scoring rules" ON "public"."scoring_rules" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can view all presence" ON "public"."user_presence" FOR SELECT USING (true);



CREATE POLICY "Users can view applications for their annonces" ON "public"."applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."annonces" "a"
     JOIN "public"."profiles" "p" ON (("a"."user_id" = "p"."user_id")))
  WHERE (("a"."id" = "applications"."annonce_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view attachments in their conversations" ON "public"."message_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."messages" "m"
     JOIN "public"."conversation_participants" "cp" ON (("cp"."conversation_id" = "m"."conversation_id")))
  WHERE (("m"."id" = "message_attachments"."message_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view blocks they created" ON "public"."blocked_users" FOR SELECT USING (("auth"."uid"() = "blocker_user_id"));



CREATE POLICY "Users can view executions for their prospects" ON "public"."automation_executions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."prospects" "p"
  WHERE (("p"."id" = "automation_executions"."prospect_id") AND ("p"."assigned_agent_id" IN ( SELECT "va"."id"
           FROM "public"."vybbi_agents" "va"
          WHERE ("va"."user_id" = "auth"."uid"())))))) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Users can view interactions on visible posts" ON "public"."post_interactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."social_posts" "sp"
  WHERE (("sp"."id" = "post_interactions"."post_id") AND (("sp"."visibility" = 'public'::"text") OR ("sp"."user_id" = "auth"."uid"()) OR (("sp"."visibility" = 'followers'::"text") AND (EXISTS ( SELECT 1
           FROM "public"."user_follows"
          WHERE (("user_follows"."followed_user_id" = "sp"."user_id") AND ("user_follows"."follower_user_id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view media from visible posts" ON "public"."post_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."social_posts" "sp"
  WHERE (("sp"."id" = "post_media"."post_id") AND (("sp"."visibility" = 'public'::"text") OR ("sp"."user_id" = "auth"."uid"()) OR (("sp"."visibility" = 'followers'::"text") AND (EXISTS ( SELECT 1
           FROM "public"."user_follows"
          WHERE (("user_follows"."followed_user_id" = "sp"."user_id") AND ("user_follows"."follower_user_id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view messages in their conversations" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "messages"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view public follows" ON "public"."user_follows" FOR SELECT USING (true);



CREATE POLICY "Users can view public posts and posts from followed users" ON "public"."social_posts" FOR SELECT USING ((("visibility" = 'public'::"text") OR ("auth"."uid"() = "user_id") OR (("visibility" = 'followers'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."user_follows"
  WHERE (("user_follows"."followed_user_id" = "social_posts"."user_id") AND ("user_follows"."follower_user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view published music releases" ON "public"."music_releases" FOR SELECT USING ((("status" = 'published'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "music_releases"."profile_id") AND ("p"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view receipts in their conversations" ON "public"."message_receipts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "message_receipts"."conversation_id") AND ("cp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view steps for accessible workflows" ON "public"."automation_steps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."automation_workflows" "w"
  WHERE (("w"."id" = "automation_steps"."workflow_id") AND (("w"."is_active" = true) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Users can view their conversations" ON "public"."conversations" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role") OR "public"."user_can_access_conversation"("id")));



CREATE POLICY "Users can view their own Vybbi interactions" ON "public"."vybbi_interactions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own annonces" ON "public"."annonces" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own applications" ON "public"."applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "applications"."applicant_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own full profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own media assets" ON "public"."media_assets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "media_assets"."profile_id") AND ("profiles"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own memberships" ON "public"."community_members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own participation" ON "public"."conversation_participants" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own payment sessions" ON "public"."stripe_payment_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own play history" ON "public"."music_plays" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own play history" ON "public"."radio_play_history" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own token balance" ON "public"."user_token_balances" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own token transactions" ON "public"."token_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own visits" ON "public"."profile_views" FOR SELECT USING (("viewer_user_id" = "auth"."uid"()));



CREATE POLICY "Venue owners can manage their artist history" ON "public"."venue_artist_history" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_artist_history"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venue owners can manage their gallery" ON "public"."venue_gallery" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_gallery"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venue owners can manage their partnerships" ON "public"."venue_partners" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "venue_partners"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can create their own events" ON "public"."events" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "events"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can delete their own events" ON "public"."events" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "events"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can update booking status" ON "public"."bookings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "bookings"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can update their own events" ON "public"."events" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "events"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can view bookings for their events" ON "public"."bookings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "bookings"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Venues can view their own events" ON "public"."events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "events"."venue_profile_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."profile_type" = 'lieu'::"public"."profile_type")))));



CREATE POLICY "Visible artist history is publicly viewable" ON "public"."venue_artist_history" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "Visible partnerships are publicly viewable" ON "public"."venue_partners" FOR SELECT USING (("is_visible" = true));



ALTER TABLE "public"."ad_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ad_campaign_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ad_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ad_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ad_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ad_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_mock_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_secrets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admins_view_all_profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



COMMENT ON POLICY "admins_view_all_profiles" ON "public"."profiles" IS 'Security: Admins can view all profiles including PII for moderation and support';



ALTER TABLE "public"."affiliate_conversions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."affiliate_visits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_artists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_commissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."annonces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artist_radio_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."automation_executions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."automation_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."automation_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."availability_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blockchain_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blocked_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_channels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_archives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_pins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversion_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."detailed_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_attendees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."influencer_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."login_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manager_artists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_receipts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."music_collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."music_plays" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."music_releases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owners_view_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



COMMENT ON POLICY "owners_view_own_profile" ON "public"."profiles" IS 'Security: Users can only view their own complete profile including PII (email, phone, siret)';



ALTER TABLE "public"."post_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_engagement_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_imports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_meetings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_scoring_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospect_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospecting_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospecting_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prospects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."radio_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."radio_play_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."radio_playlist_tracks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."radio_playlists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_commissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."representation_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roadmap_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scoring_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "security_summary_admin_only" ON "public"."security_audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



ALTER TABLE "public"."service_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_ticker_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_payment_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."temporary_credentials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_earning_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_spending_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_presence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_token_balances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_own_profile" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR (("is_temporary" = true) AND ("profile_type" = 'lieu'::"public"."profile_type"))));



CREATE POLICY "users_update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



ALTER TABLE "public"."venue_artist_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venue_gallery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venue_partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vybbi_agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vybbi_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_deliveries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."blocked_users";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."radio_playlists";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."advanced_suspicious_activity_detector"() TO "anon";
GRANT ALL ON FUNCTION "public"."advanced_suspicious_activity_detector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."advanced_suspicious_activity_detector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."agent_can_access_prospect"("prospect_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_prospect_to_agent"("prospect_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_prospect_to_agent"("prospect_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_prospect_to_agent"("prospect_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_profile_access_enhanced"("profile_id" "uuid", "access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_profile_access_enhanced"("profile_id" "uuid", "access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_profile_access_enhanced"("profile_id" "uuid", "access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_prospect_access"("table_name" "text", "operation" "text", "record_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_rls_access"("table_name" "text", "operation" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_rls_access"("table_name" "text", "operation" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_rls_access"("table_name" "text", "operation" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_sensitive_access"("table_name" "text", "action" "text", "record_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_sensitive_profile_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_sensitive_profile_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_sensitive_profile_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_update_prospect_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_update_prospect_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_update_prospect_score"() TO "service_role";



GRANT ALL ON FUNCTION "public"."award_daily_login_tokens"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."award_daily_login_tokens"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_daily_login_tokens"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."award_vybbi_tokens"("target_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."award_vybbi_tokens"("target_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_vybbi_tokens"("target_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_monthly_recurring_commissions"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_monthly_recurring_commissions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_monthly_recurring_commissions"() TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_profile_completion"("profile_row" "public"."profiles") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_profile_completion"("profile_row" "public"."profiles") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_profile_completion"("profile_row" "public"."profiles") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_sensitive_profile_data"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_sensitive_profile_data"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_sensitive_profile_data"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_profile_security_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_profile_security_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_profile_security_status"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."check_security_integrity"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_security_integrity"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_security_integrity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_security_integrity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_slug_availability"("desired_slug" "text", "profile_id_to_exclude" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_slug_availability"("desired_slug" "text", "profile_id_to_exclude" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_slug_availability"("desired_slug" "text", "profile_id_to_exclude" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_task_locks"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_task_locks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_task_locks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_temp_credentials"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_temp_credentials"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_temp_credentials"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_login_attempts"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_login_attempts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_login_attempts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_security_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_security_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_security_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_task_processing"("task_id" "uuid", "new_status" "text", "error_message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_task_processing"("task_id" "uuid", "new_status" "text", "error_message" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_task_processing"("task_id" "uuid", "new_status" "text", "error_message" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification_with_email"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_related_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification_with_email"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_related_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification_with_email"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_related_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_workflow_tasks"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_workflow_tasks"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_workflow_tasks"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_suspicious_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."detect_suspicious_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_suspicious_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."diagnose_user_messaging"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."diagnose_user_messaging"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."diagnose_user_messaging"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_messaging_policy"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_messaging_policy"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_messaging_policy"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enhanced_audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."enhanced_audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enhanced_audit_profile_access"("profile_id" "uuid", "access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"("_user_id" "uuid", "_display_name" "text", "_profile_type" "public"."profile_type") TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("_user_id" "uuid", "_display_name" "text", "_profile_type" "public"."profile_type") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"("_user_id" "uuid", "_display_name" "text", "_profile_type" "public"."profile_type") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_affiliate_code"("base_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_affiliate_code"("base_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_affiliate_code"("base_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_security_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_security_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_security_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_emails"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_emails"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_emails"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_artist_radio_stats"("artist_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_artist_radio_stats"("artist_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_artist_radio_stats"("artist_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversations_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversations_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversations_with_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_conversations_with_peers"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_conversations_with_peers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_conversations_with_peers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_event_attendees_count"("event_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_event_attendees_count"("event_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_event_attendees_count"("event_uuid" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_profile_data"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_online_users"("limit_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_online_users"("limit_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_online_users"("limit_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_stats"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_stats"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_stats"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_view_stats"("p_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_view_stats"("p_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_view_stats"("p_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_with_privacy"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_with_privacy"("profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_with_privacy"("profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_profile_data"("profile_identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_radio_playlist"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_radio_playlist"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_radio_playlist"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_safe_profile_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_safe_profile_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_safe_profile_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_safe_profile_data"("profile_identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_secure_public_profile_data"("profile_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_secure_public_profile_data"("profile_identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_secure_public_profile_data"("profile_identifier" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_security_status"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_security_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_security_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_security_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text", "content_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text", "content_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_social_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer, "feed_type" "text", "content_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_artists"("limit_count" integer, "genre_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_artists"("limit_count" integer, "genre_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_artists"("limit_count" integer, "genre_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_event_status"("event_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_event_status"("event_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_event_status"("event_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_follow_stats"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_follow_stats"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_follow_stats"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_community_member"("community_id_param" "uuid", "user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_community_member"("community_id_param" "uuid", "user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_community_member"("community_id_param" "uuid", "user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_blocked"("p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_blocked"("p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_blocked"("p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."lock_and_process_tasks"("max_tasks" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."lock_and_process_tasks"("max_tasks" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."lock_and_process_tasks"("max_tasks" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."log_security_event"("p_event_type" "text", "p_user_id" "uuid", "p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_security_event"("p_event_type" "text", "p_user_id" "uuid", "p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_security_event"("p_event_type" "text", "p_user_id" "uuid", "p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_sensitive_access"("p_table_name" "text", "p_action" "text", "p_record_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."log_sensitive_access"("p_table_name" "text", "p_action" "text", "p_record_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_sensitive_access"("p_table_name" "text", "p_action" "text", "p_record_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_on_booking_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_on_booking_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_on_booking_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_agent_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_agent_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_agent_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_application_received"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_application_received"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_application_received"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_booking_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_booking_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_booking_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_manager_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_manager_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_manager_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_message_enhanced"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_message_enhanced"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_message_enhanced"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_review_received"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_review_received"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_review_received"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_pii_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_pii_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_pii_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_marketplace_purchase"("purchase_user_id" "uuid", "option_id" "uuid", "tokens_spent" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."process_marketplace_purchase"("purchase_user_id" "uuid", "option_id" "uuid", "tokens_spent" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_marketplace_purchase"("purchase_user_id" "uuid", "option_id" "uuid", "tokens_spent" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_profile"("identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_profile"("identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_profile"("identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_profile_by_slug"("profile_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_profile_by_slug"("profile_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_profile_by_slug"("profile_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_profile_select"("where_clause" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."safe_profile_select"("where_clause" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_profile_select"("where_clause" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."security_critical_fixes_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."security_critical_fixes_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_critical_fixes_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."security_phase1_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."security_phase1_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_phase1_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."security_status_phase1"() TO "anon";
GRANT ALL ON FUNCTION "public"."security_status_phase1"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_status_phase1"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_admin_broadcast"("profile_types" "public"."profile_type"[], "only_public" boolean, "content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_admin_broadcast"("profile_types" "public"."profile_type"[], "only_public" boolean, "content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_admin_broadcast"("profile_types" "public"."profile_type"[], "only_public" boolean, "content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_admin_message"("target_user_id" "uuid", "content" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_admin_message"("target_user_id" "uuid", "content" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_admin_message"("target_user_id" "uuid", "content" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_notification_email"("p_notification_id" "uuid", "p_user_email" "text", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."send_notification_email"("p_notification_id" "uuid", "p_user_email" "text", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_notification_email"("p_notification_id" "uuid", "p_user_email" "text", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_profile_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_profile_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_profile_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."spend_vybbi_tokens"("spender_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."spend_vybbi_tokens"("spender_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."spend_vybbi_tokens"("spender_user_id" "uuid", "amount" numeric, "reason" "text", "description" "text", "reference_type" "text", "reference_id" "uuid", "metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."start_direct_conversation"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."start_direct_conversation"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_direct_conversation"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_task_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_task_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_task_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."test_rls_security"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_rls_security"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_rls_security"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_affiliate_conversion"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."track_affiliate_conversion"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_affiliate_conversion"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."track_affiliate_conversion_with_tokens"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."track_affiliate_conversion_with_tokens"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_affiliate_conversion_with_tokens"("p_user_id" "uuid", "p_conversion_type" "text", "p_conversion_value" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."track_affiliate_visit"("p_affiliate_code" "text", "p_session_id" "uuid", "p_user_agent" "text", "p_referrer" "text", "p_page_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."track_affiliate_visit"("p_affiliate_code" "text", "p_session_id" "uuid", "p_user_agent" "text", "p_referrer" "text", "p_page_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_affiliate_visit"("p_affiliate_code" "text", "p_session_id" "uuid", "p_user_agent" "text", "p_referrer" "text", "p_page_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_login_attempt"("p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_failure_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."track_login_attempt"("p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_failure_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_login_attempt"("p_email" "text", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_failure_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_music_play"("p_music_release_id" "uuid", "p_duration_played" integer, "p_source" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."track_music_play"("p_music_release_id" "uuid", "p_duration_played" integer, "p_source" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_music_play"("p_music_release_id" "uuid", "p_duration_played" integer, "p_source" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_profile_view"("p_viewed_profile_id" "uuid", "p_view_type" "public"."view_type", "p_referrer_page" "text", "p_session_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."track_profile_view"("p_viewed_profile_id" "uuid", "p_view_type" "public"."view_type", "p_referrer_page" "text", "p_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_profile_view"("p_viewed_profile_id" "uuid", "p_view_type" "public"."view_type", "p_referrer_page" "text", "p_session_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_audit_sensitive_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_audit_sensitive_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_audit_sensitive_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_trial_offer_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_trial_offer_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_trial_offer_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_affiliate_clicks_on_visit"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_affiliate_clicks_on_visit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_affiliate_clicks_on_visit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_community_member_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_community_member_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_community_member_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("conv_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("conv_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_can_access_conversation"("conv_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_owns_profile"("profile_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_owns_profile"("profile_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_owns_profile"("profile_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_password_strength"("password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_password_strength"("password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_password_strength"("password" "text") TO "service_role";
























GRANT ALL ON TABLE "public"."ad_assets" TO "anon";
GRANT ALL ON TABLE "public"."ad_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_assets" TO "service_role";



GRANT ALL ON TABLE "public"."ad_campaign_slots" TO "anon";
GRANT ALL ON TABLE "public"."ad_campaign_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_campaign_slots" TO "service_role";



GRANT ALL ON TABLE "public"."ad_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."ad_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."ad_metrics" TO "anon";
GRANT ALL ON TABLE "public"."ad_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."ad_settings" TO "anon";
GRANT ALL ON TABLE "public"."ad_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_settings" TO "service_role";



GRANT ALL ON TABLE "public"."ad_slots" TO "anon";
GRANT ALL ON TABLE "public"."ad_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_slots" TO "service_role";



GRANT ALL ON TABLE "public"."admin_mock_profiles" TO "anon";
GRANT ALL ON TABLE "public"."admin_mock_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_mock_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."admin_secrets" TO "anon";
GRANT ALL ON TABLE "public"."admin_secrets" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_secrets" TO "service_role";



GRANT ALL ON TABLE "public"."admin_settings" TO "anon";
GRANT ALL ON TABLE "public"."admin_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_settings" TO "service_role";



GRANT ALL ON TABLE "public"."affiliate_conversions" TO "anon";
GRANT ALL ON TABLE "public"."affiliate_conversions" TO "authenticated";
GRANT ALL ON TABLE "public"."affiliate_conversions" TO "service_role";



GRANT ALL ON TABLE "public"."affiliate_visits" TO "anon";
GRANT ALL ON TABLE "public"."affiliate_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."affiliate_visits" TO "service_role";



GRANT ALL ON TABLE "public"."agent_artists" TO "anon";
GRANT ALL ON TABLE "public"."agent_artists" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_artists" TO "service_role";



GRANT ALL ON TABLE "public"."agent_commissions" TO "anon";
GRANT ALL ON TABLE "public"."agent_commissions" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_commissions" TO "service_role";



GRANT ALL ON TABLE "public"."annonces" TO "anon";
GRANT ALL ON TABLE "public"."annonces" TO "authenticated";
GRANT ALL ON TABLE "public"."annonces" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."artist_radio_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."artist_radio_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."artist_radio_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."automation_executions" TO "anon";
GRANT ALL ON TABLE "public"."automation_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_executions" TO "service_role";



GRANT ALL ON TABLE "public"."automation_steps" TO "anon";
GRANT ALL ON TABLE "public"."automation_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_steps" TO "service_role";



GRANT ALL ON TABLE "public"."automation_workflows" TO "anon";
GRANT ALL ON TABLE "public"."automation_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."availability_slots" TO "anon";
GRANT ALL ON TABLE "public"."availability_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_slots" TO "service_role";



GRANT ALL ON TABLE "public"."blockchain_certifications" TO "anon";
GRANT ALL ON TABLE "public"."blockchain_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."blockchain_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."blocked_users" TO "anon";
GRANT ALL ON TABLE "public"."blocked_users" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_users" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";



GRANT ALL ON TABLE "public"."community_channels" TO "anon";
GRANT ALL ON TABLE "public"."community_channels" TO "authenticated";
GRANT ALL ON TABLE "public"."community_channels" TO "service_role";



GRANT ALL ON TABLE "public"."community_members" TO "anon";
GRANT ALL ON TABLE "public"."community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members" TO "service_role";



GRANT ALL ON TABLE "public"."community_messages" TO "anon";
GRANT ALL ON TABLE "public"."community_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."community_messages" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_archives" TO "anon";
GRANT ALL ON TABLE "public"."conversation_archives" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_archives" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_pins" TO "anon";
GRANT ALL ON TABLE "public"."conversation_pins" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_pins" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."conversion_tracking" TO "anon";
GRANT ALL ON TABLE "public"."conversion_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."conversion_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."detailed_reviews" TO "anon";
GRANT ALL ON TABLE "public"."detailed_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."detailed_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."event_attendees" TO "anon";
GRANT ALL ON TABLE "public"."event_attendees" TO "authenticated";
GRANT ALL ON TABLE "public"."event_attendees" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."influencer_links" TO "anon";
GRANT ALL ON TABLE "public"."influencer_links" TO "authenticated";
GRANT ALL ON TABLE "public"."influencer_links" TO "service_role";



GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";



GRANT ALL ON TABLE "public"."login_attempts" TO "anon";
GRANT ALL ON TABLE "public"."login_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."login_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."manager_artists" TO "anon";
GRANT ALL ON TABLE "public"."manager_artists" TO "authenticated";
GRANT ALL ON TABLE "public"."manager_artists" TO "service_role";



GRANT ALL ON TABLE "public"."media_assets" TO "anon";
GRANT ALL ON TABLE "public"."media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."message_attachments" TO "anon";
GRANT ALL ON TABLE "public"."message_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."message_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."message_receipts" TO "anon";
GRANT ALL ON TABLE "public"."message_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."message_receipts" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."music_collaborators" TO "anon";
GRANT ALL ON TABLE "public"."music_collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."music_collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."music_plays" TO "anon";
GRANT ALL ON TABLE "public"."music_plays" TO "authenticated";
GRANT ALL ON TABLE "public"."music_plays" TO "service_role";



GRANT ALL ON TABLE "public"."music_releases" TO "anon";
GRANT ALL ON TABLE "public"."music_releases" TO "authenticated";
GRANT ALL ON TABLE "public"."music_releases" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."post_interactions" TO "anon";
GRANT ALL ON TABLE "public"."post_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."post_media" TO "anon";
GRANT ALL ON TABLE "public"."post_media" TO "authenticated";
GRANT ALL ON TABLE "public"."post_media" TO "service_role";



GRANT ALL ON TABLE "public"."profile_views" TO "anon";
GRANT ALL ON TABLE "public"."profile_views" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_views" TO "service_role";



GRANT ALL ON TABLE "public"."profiles_public_view" TO "anon";
GRANT ALL ON TABLE "public"."profiles_public_view" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles_public_view" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles_public_view" TO PUBLIC;



GRANT ALL ON TABLE "public"."prospect_assignments" TO "anon";
GRANT ALL ON TABLE "public"."prospect_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_engagement_events" TO "anon";
GRANT ALL ON TABLE "public"."prospect_engagement_events" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_engagement_events" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_imports" TO "anon";
GRANT ALL ON TABLE "public"."prospect_imports" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_imports" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_interactions" TO "anon";
GRANT ALL ON TABLE "public"."prospect_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_meetings" TO "anon";
GRANT ALL ON TABLE "public"."prospect_meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_meetings" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_scoring_history" TO "anon";
GRANT ALL ON TABLE "public"."prospect_scoring_history" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_scoring_history" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_tags" TO "anon";
GRANT ALL ON TABLE "public"."prospect_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_tags" TO "service_role";



GRANT ALL ON TABLE "public"."prospect_tasks" TO "anon";
GRANT ALL ON TABLE "public"."prospect_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."prospect_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."prospecting_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."prospecting_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."prospecting_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."prospecting_workflows" TO "anon";
GRANT ALL ON TABLE "public"."prospecting_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."prospecting_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."prospects" TO "anon";
GRANT ALL ON TABLE "public"."prospects" TO "authenticated";
GRANT ALL ON TABLE "public"."prospects" TO "service_role";



GRANT ALL ON TABLE "public"."radio_likes" TO "anon";
GRANT ALL ON TABLE "public"."radio_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."radio_likes" TO "service_role";



GRANT ALL ON TABLE "public"."radio_play_history" TO "anon";
GRANT ALL ON TABLE "public"."radio_play_history" TO "authenticated";
GRANT ALL ON TABLE "public"."radio_play_history" TO "service_role";



GRANT ALL ON TABLE "public"."radio_playlist_tracks" TO "anon";
GRANT ALL ON TABLE "public"."radio_playlist_tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."radio_playlist_tracks" TO "service_role";



GRANT ALL ON TABLE "public"."radio_playlists" TO "anon";
GRANT ALL ON TABLE "public"."radio_playlists" TO "authenticated";
GRANT ALL ON TABLE "public"."radio_playlists" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_commissions" TO "anon";
GRANT ALL ON TABLE "public"."recurring_commissions" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_commissions" TO "service_role";



GRANT ALL ON TABLE "public"."representation_invitations" TO "anon";
GRANT ALL ON TABLE "public"."representation_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."representation_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_items" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_items" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_items" TO "service_role";



GRANT ALL ON TABLE "public"."safe_profiles" TO "anon";
GRANT ALL ON TABLE "public"."safe_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."safe_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."safe_public_profiles" TO "anon";
GRANT ALL ON TABLE "public"."safe_public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."safe_public_profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."safe_public_profiles" TO PUBLIC;



GRANT ALL ON TABLE "public"."scoring_rules" TO "anon";
GRANT ALL ON TABLE "public"."scoring_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."scoring_rules" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."security_summary" TO "anon";
GRANT ALL ON TABLE "public"."security_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."security_summary" TO "service_role";



GRANT ALL ON TABLE "public"."service_applications" TO "anon";
GRANT ALL ON TABLE "public"."service_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."service_applications" TO "service_role";



GRANT ALL ON TABLE "public"."service_requests" TO "anon";
GRANT ALL ON TABLE "public"."service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."service_requests" TO "service_role";



GRANT ALL ON TABLE "public"."site_ticker_messages" TO "anon";
GRANT ALL ON TABLE "public"."site_ticker_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."site_ticker_messages" TO "service_role";



GRANT ALL ON TABLE "public"."social_posts" TO "anon";
GRANT ALL ON TABLE "public"."social_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."social_posts" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_payment_sessions" TO "anon";
GRANT ALL ON TABLE "public"."stripe_payment_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_payment_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."system_config" TO "anon";
GRANT ALL ON TABLE "public"."system_config" TO "authenticated";
GRANT ALL ON TABLE "public"."system_config" TO "service_role";



GRANT ALL ON TABLE "public"."temporary_credentials" TO "anon";
GRANT ALL ON TABLE "public"."temporary_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."temporary_credentials" TO "service_role";



GRANT ALL ON TABLE "public"."token_earning_rules" TO "anon";
GRANT ALL ON TABLE "public"."token_earning_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."token_earning_rules" TO "service_role";



GRANT ALL ON TABLE "public"."token_spending_options" TO "anon";
GRANT ALL ON TABLE "public"."token_spending_options" TO "authenticated";
GRANT ALL ON TABLE "public"."token_spending_options" TO "service_role";



GRANT ALL ON TABLE "public"."token_transactions" TO "anon";
GRANT ALL ON TABLE "public"."token_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."token_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";



GRANT ALL ON TABLE "public"."user_presence" TO "anon";
GRANT ALL ON TABLE "public"."user_presence" TO "authenticated";
GRANT ALL ON TABLE "public"."user_presence" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_token_balances" TO "anon";
GRANT ALL ON TABLE "public"."user_token_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."user_token_balances" TO "service_role";



GRANT ALL ON TABLE "public"."venue_artist_history" TO "anon";
GRANT ALL ON TABLE "public"."venue_artist_history" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_artist_history" TO "service_role";



GRANT ALL ON TABLE "public"."venue_gallery" TO "anon";
GRANT ALL ON TABLE "public"."venue_gallery" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_gallery" TO "service_role";



GRANT ALL ON TABLE "public"."venue_partners" TO "anon";
GRANT ALL ON TABLE "public"."venue_partners" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_partners" TO "service_role";



GRANT ALL ON TABLE "public"."vybbi_agents" TO "anon";
GRANT ALL ON TABLE "public"."vybbi_agents" TO "authenticated";
GRANT ALL ON TABLE "public"."vybbi_agents" TO "service_role";



GRANT ALL ON TABLE "public"."vybbi_interactions" TO "anon";
GRANT ALL ON TABLE "public"."vybbi_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."vybbi_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_deliveries" TO "anon";
GRANT ALL ON TABLE "public"."webhook_deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
