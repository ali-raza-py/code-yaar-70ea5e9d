-- Remove email column from profiles table to prevent exposure
-- Emails are already securely stored in auth.users (managed by Supabase Auth)

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;