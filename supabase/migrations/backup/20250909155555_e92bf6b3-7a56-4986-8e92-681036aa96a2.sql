-- Add contract_notes column to agent_artists table
ALTER TABLE public.agent_artists 
ADD COLUMN contract_notes text;

-- Add contract_notes column to manager_artists table  
ALTER TABLE public.manager_artists
ADD COLUMN contract_notes text;