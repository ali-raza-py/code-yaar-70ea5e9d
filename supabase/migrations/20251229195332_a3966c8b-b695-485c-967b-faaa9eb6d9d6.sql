-- =============================================
-- ADVANCED SECURITY INFRASTRUCTURE
-- =============================================

-- 1. Active Sessions Table - Track all user sessions with devices
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_suspicious BOOLEAN DEFAULT false,
  suspicious_reason TEXT
);

-- 2. Trusted Devices Table
CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_trusted BOOLEAN DEFAULT true,
  UNIQUE(user_id, device_fingerprint)
);

-- 3. Security Audit Log - Comprehensive logging
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MFA Enrollment Status
CREATE TABLE IF NOT EXISTS public.mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  method TEXT DEFAULT 'totp',
  backup_codes_generated BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Security Alerts Table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT TO authenticated USING (is_admin());

-- RLS Policies for trusted_devices
CREATE POLICY "Users can manage their own devices" ON public.trusted_devices
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all devices" ON public.trusted_devices
  FOR SELECT TO authenticated USING (is_admin());

-- RLS Policies for security_audit_log
CREATE POLICY "Users can view their own audit log" ON public.security_audit_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.security_audit_log
  FOR SELECT TO authenticated USING (is_admin());

-- RLS Policies for mfa_settings
CREATE POLICY "Users can manage their own MFA" ON public.mfa_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all MFA settings" ON public.mfa_settings
  FOR SELECT TO authenticated USING (is_admin());

-- RLS Policies for security_alerts
CREATE POLICY "Users can manage their own alerts" ON public.security_alerts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all alerts" ON public.security_alerts
  FOR ALL TO authenticated USING (is_admin());

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_category TEXT,
  p_severity TEXT DEFAULT 'info',
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO security_audit_log (user_id, action, category, severity, details, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_category, p_severity, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;
  
  -- Create alert for high severity events
  IF p_severity IN ('high', 'critical') THEN
    INSERT INTO security_alerts (user_id, alert_type, title, message, severity, metadata)
    VALUES (
      p_user_id,
      p_category,
      'Security Alert: ' || p_action,
      'A ' || p_severity || ' severity security event was detected.',
      p_severity,
      p_details
    );
  END IF;
  
  RETURN v_log_id;
END;
$$;

-- Function to detect suspicious login
CREATE OR REPLACE FUNCTION public.check_suspicious_login(
  p_user_id UUID,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_suspicious BOOLEAN := false;
  v_reason TEXT := NULL;
  v_known_device BOOLEAN;
  v_recent_failed_attempts INTEGER;
  v_different_location BOOLEAN := false;
BEGIN
  -- Check if device is known
  SELECT EXISTS (
    SELECT 1 FROM trusted_devices 
    WHERE user_id = p_user_id 
    AND is_trusted = true
  ) INTO v_known_device;
  
  -- Check recent failed attempts
  SELECT COUNT(*) INTO v_recent_failed_attempts
  FROM login_attempts
  WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id)
  AND success = false
  AND attempt_at > now() - interval '1 hour';
  
  -- Determine if suspicious
  IF v_recent_failed_attempts >= 3 THEN
    v_is_suspicious := true;
    v_reason := 'Multiple failed login attempts detected';
  END IF;
  
  IF NOT v_known_device THEN
    -- Log new device login
    PERFORM log_security_event(
      p_user_id,
      'new_device_login',
      'authentication',
      'medium',
      jsonb_build_object('ip_address', p_ip_address, 'user_agent', p_user_agent)
    );
  END IF;
  
  RETURN jsonb_build_object(
    'is_suspicious', v_is_suspicious,
    'reason', v_reason,
    'is_new_device', NOT v_known_device
  );
END;
$$;

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_device_info JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_session_token TEXT;
BEGIN
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Mark all other sessions as not current
  UPDATE user_sessions SET is_current = false WHERE user_id = p_user_id;
  
  -- Create new session
  INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, user_agent, is_current)
  VALUES (p_user_id, v_session_token, p_device_info, p_ip_address, p_user_agent, true)
  RETURNING id INTO v_session_id;
  
  -- Log the session creation
  PERFORM log_security_event(
    p_user_id,
    'session_created',
    'authentication',
    'info',
    jsonb_build_object('session_id', v_session_id, 'ip_address', p_ip_address)
  );
  
  RETURN v_session_id;
END;
$$;

-- Function to terminate session
CREATE OR REPLACE FUNCTION public.terminate_session(
  p_session_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM user_sessions WHERE id = p_session_id;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  DELETE FROM user_sessions WHERE id = p_session_id;
  
  PERFORM log_security_event(
    v_user_id,
    'session_terminated',
    'authentication',
    'info',
    jsonb_build_object('session_id', p_session_id)
  );
  
  RETURN true;
END;
$$;

-- Function to get user security status
CREATE OR REPLACE FUNCTION public.get_security_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mfa_enabled BOOLEAN;
  v_active_sessions INTEGER;
  v_trusted_devices INTEGER;
  v_recent_alerts INTEGER;
  v_last_login TIMESTAMPTZ;
BEGIN
  SELECT is_enabled INTO v_mfa_enabled FROM mfa_settings WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_active_sessions FROM user_sessions WHERE user_id = p_user_id AND expires_at > now();
  SELECT COUNT(*) INTO v_trusted_devices FROM trusted_devices WHERE user_id = p_user_id AND is_trusted = true;
  SELECT COUNT(*) INTO v_recent_alerts FROM security_alerts WHERE user_id = p_user_id AND is_read = false;
  SELECT MAX(created_at) INTO v_last_login FROM user_sessions WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'mfa_enabled', COALESCE(v_mfa_enabled, false),
    'active_sessions', COALESCE(v_active_sessions, 0),
    'trusted_devices', COALESCE(v_trusted_devices, 0),
    'unread_alerts', COALESCE(v_recent_alerts, 0),
    'last_login', v_last_login
  );
END;
$$;