-- Create family_members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  nickname TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  birth_year TEXT,
  death_year TEXT,
  is_deceased BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.family_members(id),
  spouse_id UUID REFERENCES public.family_members(id),
  generation_level INTEGER DEFAULT 0,
  bio TEXT,
  location TEXT,
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_members
CREATE POLICY "Anyone can view family members"
  ON public.family_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert family members"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update family members"
  ON public.family_members FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create tales table
CREATE TABLE public.tales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  related_member_id UUID REFERENCES public.family_members(id),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tales ENABLE ROW LEVEL SECURITY;

-- RLS policies for tales
CREATE POLICY "Anyone can view published tales"
  ON public.tales FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own tales"
  ON public.tales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tales"
  ON public.tales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tales"
  ON public.tales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tales"
  ON public.tales FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tales_updated_at
  BEFORE UPDATE ON public.tales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();