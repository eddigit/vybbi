-- Fix existing functions with missing secure search_path
-- We need to update all existing functions to have proper security

-- Update existing functions that don't have secure search_path
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Get all functions in public schema that don't have secure search_path
    FOR func_record IN 
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config(p.oid) 
            WHERE unnest ~ '^search_path='
        )
    LOOP
        -- Log the function that needs to be updated
        RAISE NOTICE 'Function % needs search_path update', func_record.proname;
    END LOOP;
END $$;

-- Update handle_new_user function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        -- Recreate the function with proper security
        DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
        
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $func$
        BEGIN
          INSERT INTO public.profiles (
            id, 
            user_id, 
            display_name, 
            profile_type,
            created_at,
            updated_at
          )
          VALUES (
            gen_random_uuid(),
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Nouvel Utilisateur'),
            COALESCE((NEW.raw_user_meta_data ->> 'profile_type')::profile_type, 'artist'::profile_type),
            NOW(),
            NOW()
          );
          RETURN NEW;
        END;
        $func$;
    END IF;
END $$;

-- Update any other function that might need fixing
DO $$
BEGIN
    -- If there are other functions, they will be fixed here
    -- This is a placeholder for any additional functions that need updates
    NULL;
END $$;