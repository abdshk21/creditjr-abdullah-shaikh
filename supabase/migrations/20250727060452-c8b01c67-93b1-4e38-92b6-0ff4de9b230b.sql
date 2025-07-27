-- Add icon column to custom_categories table
ALTER TABLE public.custom_categories 
ADD COLUMN icon TEXT DEFAULT '📂';