-- Create daily_questions table
CREATE TABLE public.daily_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_answers table
CREATE TABLE public.daily_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Create user_activity table to track AI usage
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Daily Questions RLS
CREATE POLICY "Anyone can view active daily questions"
ON public.daily_questions
FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert daily questions"
ON public.daily_questions
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins can update daily questions"
ON public.daily_questions
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete daily questions"
ON public.daily_questions
FOR DELETE
USING (is_admin());

-- Daily Answers RLS
CREATE POLICY "Users can view all answers for active questions"
ON public.daily_answers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.daily_questions 
  WHERE id = question_id AND (is_active = true OR is_admin())
));

CREATE POLICY "Authenticated users can submit answers"
ON public.daily_answers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update answers"
ON public.daily_answers
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete answers"
ON public.daily_answers
FOR DELETE
USING (is_admin());

-- User Activity RLS
CREATE POLICY "Users can view their own activity"
ON public.user_activity
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
ON public.user_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.user_activity
FOR SELECT
USING (is_admin());

-- Create indexes
CREATE INDEX idx_daily_questions_active ON public.daily_questions(is_active);
CREATE INDEX idx_daily_answers_question ON public.daily_answers(question_id);
CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);