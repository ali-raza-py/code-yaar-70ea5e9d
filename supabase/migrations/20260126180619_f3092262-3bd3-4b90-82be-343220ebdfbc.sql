-- Create AI Tools table for managing Top AI Tools
CREATE TABLE public.ai_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  use_case TEXT,
  category TEXT NOT NULL DEFAULT 'coding-assistants',
  url TEXT,
  icon TEXT,
  is_featured BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table for tracking user learning progress
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- AI Tools policies (public read, admin write)
CREATE POLICY "Anyone can view published AI tools"
  ON public.ai_tools FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins can insert AI tools"
  ON public.ai_tools FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update AI tools"
  ON public.ai_tools FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete AI tools"
  ON public.ai_tools FOR DELETE
  USING (is_admin());

-- User Progress policies
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any user progress"
  ON public.user_progress FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete any user progress"
  ON public.user_progress FOR DELETE
  USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX idx_ai_tools_featured ON public.ai_tools(is_featured, is_published);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON public.ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();