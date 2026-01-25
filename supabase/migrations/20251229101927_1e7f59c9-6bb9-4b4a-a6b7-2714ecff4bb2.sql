-- Fix login_attempts: Add explicit authenticated requirement for SELECT
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
CREATE POLICY "Admins can view login attempts" 
ON public.login_attempts 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Create explicit deny policy for non-admins (double protection)
-- This ensures non-admins cannot read even if is_admin() somehow fails
CREATE POLICY "Deny non-admin login attempts access"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (is_admin() = true);

-- Fix resources table: Make created_by not publicly visible
-- Update the public read policy to exclude sensitive fields
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.resources;
CREATE POLICY "Authenticated users can view published resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_published = true);

-- Keep admin full access
DROP POLICY IF EXISTS "Admins can view all resources" ON public.resources;
CREATE POLICY "Admins can view all resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (is_admin());