-- Create table for site ticker messages
CREATE TABLE public.site_ticker_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_ticker_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all ticker messages"
ON public.site_ticker_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active ticker messages"
ON public.site_ticker_messages
FOR SELECT
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_ticker_messages_updated_at
BEFORE UPDATE ON public.site_ticker_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();