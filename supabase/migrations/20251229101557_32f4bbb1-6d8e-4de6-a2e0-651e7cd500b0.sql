-- Drop the permissive INSERT policy
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;

-- Create a secure function to record login attempts (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  user_email TEXT,
  was_successful BOOLEAN,
  client_ip TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format (basic check)
  IF user_email IS NULL OR LENGTH(user_email) < 3 OR LENGTH(user_email) > 255 THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Insert the login attempt
  INSERT INTO public.login_attempts (email, success, ip_address)
  VALUES (user_email, was_successful, client_ip);
END;
$$;

-- Grant execute permission to authenticated and anon users (needed for login flow)
GRANT EXECUTE ON FUNCTION public.record_login_attempt(TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(TEXT, BOOLEAN, TEXT) TO anon;