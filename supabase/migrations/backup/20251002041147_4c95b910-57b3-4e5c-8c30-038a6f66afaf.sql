
-- Add order_number field to admin_secrets for drag & drop ordering
ALTER TABLE public.admin_secrets 
ADD COLUMN IF NOT EXISTS order_number INTEGER;

-- Initialize order_number for existing records based on created_at
UPDATE public.admin_secrets 
SET order_number = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.admin_secrets
) AS subquery
WHERE public.admin_secrets.id = subquery.id;

-- Set default for new records
ALTER TABLE public.admin_secrets 
ALTER COLUMN order_number SET DEFAULT 0;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_secrets_order ON public.admin_secrets(order_number);

COMMENT ON COLUMN public.admin_secrets.order_number IS 
'Order number for manual sorting via drag and drop. Lower numbers appear first.';
