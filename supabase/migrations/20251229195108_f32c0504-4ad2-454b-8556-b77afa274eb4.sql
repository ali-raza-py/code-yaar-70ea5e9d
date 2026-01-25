-- Strengthen login_attempts protection
-- Only allow service role to insert (via RPC function)
-- Admins can only SELECT, not modify records

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can access login attempts" ON public.login_attempts;

-- Create separate, explicit policies for better security
-- Admins can only VIEW login attempts (not modify)
CREATE POLICY "Admins can only view login attempts" 
ON public.login_attempts 
FOR SELECT 
TO authenticated
USING (is_admin());

-- No INSERT/UPDATE/DELETE policies for regular users
-- Insertions only happen through the secure record_login_attempt() RPC function
-- which uses SECURITY DEFINER and bypasses RLS

-- Add a comment for documentation
COMMENT ON TABLE public.login_attempts IS 'Stores login attempt records for security monitoring. INSERT only via record_login_attempt() RPC. SELECT restricted to admins only.';