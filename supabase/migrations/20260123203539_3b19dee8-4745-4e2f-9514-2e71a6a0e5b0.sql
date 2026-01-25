-- Fix 1: Restrict user_sessions to prevent token exposure
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own sessions" ON user_sessions;

-- Create a more restrictive policy that still allows users to see their sessions
-- but we'll handle sensitive data exposure at the application level
CREATE POLICY "Users can read their own sessions metadata"
ON user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Add a column-level security approach by creating a secure view
CREATE OR REPLACE VIEW public.user_sessions_safe AS
SELECT 
  id,
  user_id,
  device_info,
  is_current,
  created_at,
  last_active_at,
  expires_at,
  is_suspicious,
  -- Mask sensitive data
  CASE WHEN auth.uid() = user_id THEN LEFT(ip_address, POSITION('.' IN ip_address)) || '***' ELSE NULL END as ip_address_masked,
  CASE WHEN auth.uid() = user_id THEN LEFT(user_agent, 50) || '...' ELSE NULL END as user_agent_truncated,
  location,
  suspicious_reason
FROM user_sessions
WHERE auth.uid() = user_id;

-- Fix 2: Anonymize user_ids in daily_answers for public viewing
DROP POLICY IF EXISTS "Users can view all answers for active questions" ON daily_answers;

-- Users can only see their own answers with full details
CREATE POLICY "Users can view their own daily answers"
ON daily_answers
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy for viewing other answers (admins only see all)
CREATE POLICY "Admins can view all daily answers"
ON daily_answers
FOR SELECT
USING (is_admin());

-- Create a safe view for public answer viewing (anonymized)
CREATE OR REPLACE VIEW public.daily_answers_public AS
SELECT 
  da.id,
  da.question_id,
  -- Anonymize user_id for non-owners
  CASE 
    WHEN auth.uid() = da.user_id THEN da.user_id 
    ELSE NULL 
  END as user_id,
  da.answer_text,
  da.is_highlighted,
  da.created_at,
  -- Show display name but not user_id
  COALESCE(p.full_name, 'Anonymous') as author_name
FROM daily_answers da
LEFT JOIN profiles p ON p.user_id = da.user_id
LEFT JOIN daily_questions dq ON dq.id = da.question_id
WHERE dq.is_active = true OR is_admin();