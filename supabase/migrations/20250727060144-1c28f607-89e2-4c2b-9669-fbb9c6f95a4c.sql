-- Create custom_categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own categories" 
ON public.custom_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.custom_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate category names per user
CREATE UNIQUE INDEX idx_custom_categories_user_category 
ON public.custom_categories(user_id, category_name);