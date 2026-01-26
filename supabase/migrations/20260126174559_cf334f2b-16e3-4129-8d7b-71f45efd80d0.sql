-- Create help_faq table for Help/FAQ entries
CREATE TABLE public.help_faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_faq ENABLE ROW LEVEL SECURITY;

-- Public can view published FAQs
CREATE POLICY "Anyone can view published FAQs"
ON public.help_faq
FOR SELECT
USING (is_published = true OR is_admin());

-- Admins can manage FAQs
CREATE POLICY "Admins can insert FAQs"
ON public.help_faq
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update FAQs"
ON public.help_faq
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete FAQs"
ON public.help_faq
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_help_faq_updated_at
BEFORE UPDATE ON public.help_faq
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Add index for category filtering
CREATE INDEX idx_help_faq_category ON public.help_faq(category);
CREATE INDEX idx_help_faq_sort_order ON public.help_faq(sort_order);