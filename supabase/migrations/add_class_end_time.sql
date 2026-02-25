-- Add class_end_time column to classes table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS class_end_time VARCHAR(10);

-- Add comment
COMMENT ON COLUMN public.classes.class_end_time IS 'Time when the class ends (HH:MM format)';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_end_time ON public.classes(class_end_time);
