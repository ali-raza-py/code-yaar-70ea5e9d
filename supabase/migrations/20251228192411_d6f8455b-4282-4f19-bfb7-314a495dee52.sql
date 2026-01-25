-- Add a permissive policy that requires authentication for viewing profiles
-- This ensures only authenticated users can access the profiles table
CREATE POLICY "Require authentication for profiles access" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Note: The existing restrictive policies will still apply (users see own profile OR admins see all)
-- This permissive policy just ensures unauthenticated/anonymous users are blocked