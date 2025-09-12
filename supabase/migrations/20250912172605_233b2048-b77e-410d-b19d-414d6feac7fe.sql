-- Fix the prospects table foreign key constraint for created_by field
-- The created_by field should reference auth.users or vybbi_agents, but not both

-- First check what foreign key constraint exists
DO $$
BEGIN
  -- Drop the existing foreign key constraint on created_by if it references vybbi_agents
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'prospects' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'created_by'
    AND tc.constraint_name = 'prospects_created_by_fkey'
  ) THEN
    ALTER TABLE public.prospects DROP CONSTRAINT prospects_created_by_fkey;
  END IF;
  
  -- The created_by field should reference auth.users, not vybbi_agents
  -- Add the correct foreign key constraint
  ALTER TABLE public.prospects 
  ADD CONSTRAINT prospects_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id);
END $$;