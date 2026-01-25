-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Questions RLS policies
CREATE POLICY "Anyone can view visible questions"
ON public.questions
FOR SELECT
USING (is_hidden = false OR is_admin());

CREATE POLICY "Authenticated users can create questions"
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update questions"
ON public.questions
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete questions"
ON public.questions
FOR DELETE
USING (is_admin());

-- Answers RLS policies
CREATE POLICY "Anyone can view visible answers"
ON public.answers
FOR SELECT
USING (is_hidden = false OR is_admin());

CREATE POLICY "Authenticated users can create answers"
ON public.answers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update answers"
ON public.answers
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete answers"
ON public.answers
FOR DELETE
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_answers_created_at ON public.answers(created_at DESC);