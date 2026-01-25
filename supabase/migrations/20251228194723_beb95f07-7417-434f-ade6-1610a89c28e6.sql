-- Drop the ineffective policy
DROP POLICY IF EXISTS "Require authentication for profiles access" ON public.profiles;

-- Create a proper authentication check policy
CREATE POLICY "Require authentication for profiles access"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);