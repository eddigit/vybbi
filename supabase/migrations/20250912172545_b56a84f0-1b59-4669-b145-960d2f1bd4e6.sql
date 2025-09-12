-- Fix RLS for prospects insert and allow users to create their own agent profile

-- 1) Correct the WITH CHECK clause for agents creating prospects
DO $$
BEGIN
  -- Only alter if the policy exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'prospects' AND policyname = 'Agents can create prospects'
  ) THEN
    ALTER POLICY "Agents can create prospects"
    ON public.prospects
    WITH CHECK (
      -- The caller must have a vybbi_agents row
      EXISTS (
        SELECT 1 FROM public.vybbi_agents va
        WHERE va.user_id = auth.uid()
      )
      -- The created_by must be the caller
      AND created_by = auth.uid()
      -- The assigned_agent_id must belong to the caller's agent profile
      AND assigned_agent_id IN (
        SELECT va.id FROM public.vybbi_agents va WHERE va.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 2) Allow authenticated users to create their own vybbi_agents row (self-serve agent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vybbi_agents' AND policyname = 'Users can create their own agent'
  ) THEN
    CREATE POLICY "Users can create their own agent"
    ON public.vybbi_agents
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;