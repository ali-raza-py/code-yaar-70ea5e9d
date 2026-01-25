-- Remove email column from profiles table as it exposes sensitive data
-- Email addresses are already securely stored in auth.users and should not be duplicated in public tables
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;