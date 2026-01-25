-- Fix questions table: require authentication to view
DROP POLICY IF EXISTS "Anyone can view visible questions" ON public.questions;
CREATE POLICY "Authenticated users can view visible questions"
ON public.questions
FOR SELECT
TO authenticated
USING (is_hidden = false OR is_admin());

-- Fix answers table: require authentication to view
DROP POLICY IF EXISTS "Anyone can view visible answers" ON public.answers;
CREATE POLICY "Authenticated users can view visible answers"
ON public.answers
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.questions 
  WHERE id = question_id AND (is_hidden = false OR is_admin())
));