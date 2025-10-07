-- Fix RLS policies for prospect creation
-- Allow admins to insert prospects
CREATE POLICY "Admins can insert prospects" ON public.prospects 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert vybbi_agents
CREATE POLICY "Admins can insert agents" ON public.vybbi_agents 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all vybbi_agents
CREATE POLICY "Admins can view all agents" ON public.vybbi_agents 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));