-- Fix bookings table structure
-- First, let's make sure the bookings table has all required columns

-- Add total_hours column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'total_hours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN total_hours INTEGER;
        
        -- Update existing records to calculate hours from days
        UPDATE public.bookings 
        SET total_hours = total_days * 24
        WHERE total_hours IS NULL;
        
        -- Add NOT NULL constraint
        ALTER TABLE public.bookings 
        ALTER COLUMN total_hours SET NOT NULL;
    END IF;
END $$;

-- Ensure the table has all expected columns
DO $$
BEGIN
    -- Add any other missing columns that might be needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'payment_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_id TEXT;
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.bookings.total_hours IS 'Total duration of booking in hours';
