-- Create hymns table for storing hymn lyrics
CREATE TABLE public.hymns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hymn_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  author TEXT,
  hymn_book TEXT NOT NULL DEFAULT 'difela_tsa_sione',
  language TEXT NOT NULL DEFAULT 'Setswana',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hymns ENABLE ROW LEVEL SECURITY;

-- Anyone can view hymns
CREATE POLICY "Anyone can view hymns" 
ON public.hymns 
FOR SELECT 
USING (true);

-- Only authenticated users can insert hymns
CREATE POLICY "Authenticated users can insert hymns" 
ON public.hymns 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create conversation_messages table for MAGGIE chat history
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own messages" 
ON public.conversation_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages" 
ON public.conversation_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON public.conversation_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for hymns updated_at
CREATE TRIGGER update_hymns_updated_at
BEFORE UPDATE ON public.hymns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();