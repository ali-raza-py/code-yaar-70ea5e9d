-- Create certificates table for tracking issued certificates
CREATE TABLE public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID,
    revoke_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Prevent duplicate certificates for same user/course
    UNIQUE(user_id, course_id)
);

-- Create index for faster verification lookups
CREATE INDEX idx_certificates_verification_id ON public.certificates(verification_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);

-- Enable Row Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view certificates for verification (public verification page)
CREATE POLICY "Anyone can view certificates for verification"
ON public.certificates
FOR SELECT
USING (true);

-- Users can insert their own certificates (when completing a course)
CREATE POLICY "Users can insert their own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update certificates (for revoking)
CREATE POLICY "Admins can update certificates"
ON public.certificates
FOR UPDATE
USING (is_admin());

-- Admins can delete certificates
CREATE POLICY "Admins can delete certificates"
ON public.certificates
FOR DELETE
USING (is_admin());

-- Create function to generate unique verification ID
CREATE OR REPLACE FUNCTION public.generate_verification_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'CY-';
    i INT;
BEGIN
    -- Generate 3 groups of 4 characters separated by dashes
    FOR i IN 1..4 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    result := result || '-';
    FOR i IN 1..4 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    result := result || '-';
    FOR i IN 1..4 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Create function to issue certificate on course completion
CREATE OR REPLACE FUNCTION public.issue_certificate(
    p_user_id UUID,
    p_course_id UUID,
    p_student_name TEXT,
    p_course_name TEXT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS public.certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_verification_id TEXT;
    v_certificate public.certificates;
    v_attempts INT := 0;
BEGIN
    -- Check if certificate already exists
    SELECT * INTO v_certificate 
    FROM public.certificates 
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    IF FOUND THEN
        RETURN v_certificate;
    END IF;
    
    -- Generate unique verification ID with retry logic
    LOOP
        v_verification_id := generate_verification_id();
        v_attempts := v_attempts + 1;
        
        -- Check if ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.certificates WHERE verification_id = v_verification_id) THEN
            EXIT;
        END IF;
        
        -- Prevent infinite loop
        IF v_attempts > 10 THEN
            RAISE EXCEPTION 'Failed to generate unique verification ID';
        END IF;
    END LOOP;
    
    -- Insert new certificate
    INSERT INTO public.certificates (
        verification_id,
        user_id,
        course_id,
        student_name,
        course_name,
        start_date,
        end_date
    ) VALUES (
        v_verification_id,
        p_user_id,
        p_course_id,
        p_student_name,
        p_course_name,
        p_start_date,
        p_end_date
    )
    RETURNING * INTO v_certificate;
    
    RETURN v_certificate;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();