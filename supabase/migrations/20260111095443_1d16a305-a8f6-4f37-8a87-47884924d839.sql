-- Fix the daily_questions update policy to include WITH CHECK
DROP POLICY IF EXISTS "Admins can update daily questions" ON public.daily_questions;

CREATE POLICY "Admins can update daily questions"
ON public.daily_questions
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());