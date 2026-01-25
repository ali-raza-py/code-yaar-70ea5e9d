-- Add verify_admin_access RPC function for server-side admin verification
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin();
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_admin_access() TO authenticated;

-- Ensure login_attempts has no INSERT policy (we use RPC now)
-- The INSERT policy was already dropped, verify it stays that way by recreating restrictive policies

-- Drop and recreate login_attempts SELECT policy with explicit authenticated requirement
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
CREATE POLICY "Admins can view login attempts" 
ON public.login_attempts 
FOR SELECT 
TO authenticated
USING (is_admin());

-- profiles: Ensure explicit authenticated-only access
-- Already done in previous migration, but let's verify the TO authenticated clause
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());