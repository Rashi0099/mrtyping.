-- Create level_completions table to track user progress
CREATE TABLE public.level_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level_number INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  UNIQUE(user_id, level_number)
);

-- Enable RLS
ALTER TABLE public.level_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view their own completions"
ON public.level_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert their own completions"
ON public.level_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions (for better scores)
CREATE POLICY "Users can update their own completions"
ON public.level_completions
FOR UPDATE
USING (auth.uid() = user_id);