-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources', 
  'resources', 
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'video/mp4', 'video/webm', 'video/quicktime', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']
);

-- Create storage policies for resources bucket
CREATE POLICY "Allow public read access for resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Allow admins to upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow admins to update resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Allow admins to delete resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);