-- 1. Create login_attempts table for tracking failed logins
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address text,
  attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Admin-only access to login_attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert login attempts"
ON public.login_attempts FOR INSERT
WITH CHECK (true);

-- 2. Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access to audit log
CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert audit log"
ON public.admin_audit_log FOR INSERT
WITH CHECK (is_admin());

-- 3. Create ai_usage_limits table for daily rate limiting
CREATE TABLE IF NOT EXISTS public.ai_usage_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  daily_requests integer NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  max_daily_requests integer NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_usage_limits
ALTER TABLE public.ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own limits
CREATE POLICY "Users can view their own usage limits"
ON public.ai_usage_limits FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all limits
CREATE POLICY "Admins can view all usage limits"
ON public.ai_usage_limits FOR SELECT
USING (is_admin());

-- System can insert/update usage limits (via edge function with service role)
CREATE POLICY "Users can update their own usage"
ON public.ai_usage_limits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage limits"
ON public.ai_usage_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Function to check if user is rate limited
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_record ai_usage_limits%ROWTYPE;
  result jsonb;
BEGIN
  -- Get or create usage record
  SELECT * INTO usage_record FROM ai_usage_limits WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    INSERT INTO ai_usage_limits (user_id, daily_requests, last_reset_date)
    VALUES (user_uuid, 0, CURRENT_DATE)
    RETURNING * INTO usage_record;
  END IF;
  
  -- Reset counter if new day
  IF usage_record.last_reset_date < CURRENT_DATE THEN
    UPDATE ai_usage_limits 
    SET daily_requests = 0, last_reset_date = CURRENT_DATE, updated_at = now()
    WHERE user_id = user_uuid
    RETURNING * INTO usage_record;
  END IF;
  
  -- Check if rate limited
  IF usage_record.daily_requests >= usage_record.max_daily_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'max', usage_record.max_daily_requests,
      'reset_at', (CURRENT_DATE + interval '1 day')::text
    );
  END IF;
  
  -- Increment counter
  UPDATE ai_usage_limits 
  SET daily_requests = daily_requests + 1, updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', usage_record.max_daily_requests - usage_record.daily_requests - 1,
    'max', usage_record.max_daily_requests
  );
END;
$$;

-- 5. Function to check login attempts
CREATE OR REPLACE FUNCTION public.check_login_blocked(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count integer;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_count
  FROM login_attempts
  WHERE email = user_email
    AND success = false
    AND attempt_at > now() - interval '15 minutes';
  
  RETURN failed_count >= 5;
END;
$$;

-- 6. Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  table_name text,
  record_id uuid DEFAULT NULL,
  old_record jsonb DEFAULT NULL,
  new_record jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_admin() THEN
    INSERT INTO admin_audit_log (admin_id, action, target_table, target_id, old_data, new_data)
    VALUES (auth.uid(), action_type, table_name, record_id, old_record, new_record);
  END IF;
END;
$$;

-- 7. Update existing policies for stricter access control
-- Ensure user_roles is strictly admin-only (fix any existing loose policies)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles only"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR is_admin());

-- 8. Add index for efficient login attempt lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_at DESC);

-- 9. Add index for AI usage lookups
CREATE INDEX IF NOT EXISTS idx_ai_usage_limits_user 
ON public.ai_usage_limits(user_id);