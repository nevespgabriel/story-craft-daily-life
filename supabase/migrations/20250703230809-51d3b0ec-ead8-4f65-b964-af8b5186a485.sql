-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policies for daily_goals table
CREATE POLICY "Users can view their own daily goals" 
ON public.daily_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals" 
ON public.daily_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals" 
ON public.daily_goals 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily goals" 
ON public.daily_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for favorite_stories table
CREATE POLICY "Users can view their own favorite stories" 
ON public.favorite_stories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite stories" 
ON public.favorite_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite stories" 
ON public.favorite_stories 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite stories" 
ON public.favorite_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for story_progress table
CREATE POLICY "Users can view their own story progress" 
ON public.story_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own story progress" 
ON public.story_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story progress" 
ON public.story_progress 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();