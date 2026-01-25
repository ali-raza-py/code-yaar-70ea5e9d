-- Create table to track password strength metadata
CREATE TABLE public.password_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  password_length integer NOT NULL,
  strength text NOT NULL DEFAULT 'weak',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_metadata ENABLE ROW LEVEL SECURITY;

-- Users can view their own password metadata
CREATE POLICY "Users can view their own password metadata"
ON public.password_metadata
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own password metadata
CREATE POLICY "Users can update their own password metadata"
ON public.password_metadata
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own password metadata
CREATE POLICY "Users can insert their own password metadata"
ON public.password_metadata
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_password_metadata_updated_at
BEFORE UPDATE ON public.password_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();