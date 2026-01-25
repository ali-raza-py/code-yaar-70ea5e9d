-- Remove the overly permissive policy that exposes all profiles to authenticated users
-- The existing restrictive policies already handle proper access control:
-- - "Users can view their own profile" (auth.uid() = user_id)
-- - "Admins can view all profiles" (is_admin())
DROP POLICY IF EXISTS "Require authentication for profiles access" ON public.profiles;