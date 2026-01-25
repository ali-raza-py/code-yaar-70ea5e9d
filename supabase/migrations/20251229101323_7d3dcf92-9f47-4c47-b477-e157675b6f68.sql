-- Drop existing permissive SELECT policies on profiles that allow unauthenticated access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new restrictive policies requiring authentication
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles  
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Also fix login_attempts table - ensure it requires admin for all reads
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;

CREATE POLICY "Admins can view login attempts" 
ON public.login_attempts 
FOR SELECT 
TO authenticated
USING (is_admin());