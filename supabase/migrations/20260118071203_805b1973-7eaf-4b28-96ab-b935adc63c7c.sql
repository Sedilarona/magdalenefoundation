-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE,
  event_end_date DATE,
  location TEXT,
  announcement_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read announcements
CREATE POLICY "Anyone can view active announcements" 
ON public.announcements 
FOR SELECT 
USING (is_active = true);

-- Add phone_number and services to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[];

-- Update profiles RLS policy to allow updates
CREATE POLICY "Users can update their own profile phone and services" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert announcements
INSERT INTO public.announcements (title, description, event_date, event_end_date, location, announcement_type) VALUES
('Family Reunion in Kopong', 'Annual family reunion gathering - come celebrate together with the whole family!', '2026-12-31', '2027-01-02', 'Kopong', 'event'),
('Tshepo Poane''s 70th Birthday', 'Join us to celebrate Tshepo Poane turning 70 years old!', '2027-01-03', NULL, 'Gaborone', 'birthday');