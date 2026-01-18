
-- Create scripture_content table for storing parsed scripture text
CREATE TABLE public.scripture_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL,
  chapter_number INTEGER,
  verse_number INTEGER,
  content TEXT NOT NULL,
  section_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scripture_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read scriptures (public content)
CREATE POLICY "Scripture content is publicly readable" 
ON public.scripture_content 
FOR SELECT 
USING (true);
