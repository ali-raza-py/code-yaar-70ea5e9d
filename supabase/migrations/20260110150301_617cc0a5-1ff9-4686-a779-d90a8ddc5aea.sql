-- Security hardening: prevent anonymous/public SELECT access to sensitive tables

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE IF EXISTS public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.password_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: drop all SELECT policies for a given table in public schema
DO $$
DECLARE
  r RECORD;
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'login_attempts',
    'security_audit_log',
    'user_sessions',
    'trusted_devices',
    'mfa_settings',
    'password_metadata',
    'security_alerts',
    'ai_chat_history',
    'profiles'
  ]
  LOOP
    FOR r IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND cmd = 'SELECT'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- Re-create safe SELECT policies (authenticated only)

-- login_attempts: only admins should be able to read
CREATE POLICY "Admins can read login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- security_audit_log: users can read their own logs (must be authenticated)
CREATE POLICY "Users can read their own security audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- user_sessions: users can read their own sessions (must be authenticated)
CREATE POLICY "Users can read their own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- user_sessions: add missing INSERT policy (prevents session injection)
CREATE POLICY "Users can create their own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- trusted_devices: users can read their own devices (must be authenticated)
CREATE POLICY "Users can read their own trusted devices"
ON public.trusted_devices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- mfa_settings: users can read their own MFA settings (authenticated only)
CREATE POLICY "Users can read their own MFA settings"
ON public.mfa_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- password_metadata: users can read their own password metadata (authenticated only)
CREATE POLICY "Users can read their own password metadata"
ON public.password_metadata
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- security_alerts: users can read their own alerts (authenticated only)
CREATE POLICY "Users can read their own security alerts"
ON public.security_alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ai_chat_history: users can read their own history (authenticated only)
CREATE POLICY "Users can read their own AI chat history"
ON public.ai_chat_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- profiles: users can read their own profile (authenticated only)
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Column-level hardening: sensitive identifiers should not be selectable
-- (Safe because app does not query these columns directly)
REVOKE SELECT (session_token) ON public.user_sessions FROM anon, authenticated;
REVOKE SELECT (device_fingerprint) ON public.trusted_devices FROM anon, authenticated;
