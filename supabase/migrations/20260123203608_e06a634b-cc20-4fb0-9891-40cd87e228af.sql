-- Fix SECURITY DEFINER views by dropping and recreating with SECURITY INVOKER

-- Drop the problematic views
DROP VIEW IF EXISTS public.user_sessions_safe;
DROP VIEW IF EXISTS public.daily_answers_public;

-- Recreate user_sessions_safe with SECURITY INVOKER (default, explicit for clarity)
CREATE VIEW public.user_sessions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  device_info,
  is_current,
  created_at,
  last_active_at,
  expires_at,
  is_suspicious,
  LEFT(ip_address, POSITION('.' IN ip_address)) || '***' as ip_address_masked,
  LEFT(user_agent, 50) || '...' as user_agent_truncated,
  location,
  suspicious_reason
FROM user_sessions;

-- Recreate daily_answers_public with SECURITY INVOKER
CREATE VIEW public.daily_answers_public 
WITH (security_invoker = true)
AS
SELECT 
  da.id,
  da.question_id,
  da.answer_text,
  da.is_highlighted,
  da.created_at,
  COALESCE(p.full_name, 'Anonymous') as author_name
FROM daily_answers da
LEFT JOIN profiles p ON p.user_id = da.user_id
LEFT JOIN daily_questions dq ON dq.id = da.question_id
WHERE dq.is_active = true;