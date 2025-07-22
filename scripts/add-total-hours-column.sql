-- Add total_hours column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN total_hours INTEGER;

-- Update existing records to calculate hours based on start_time/end_time
UPDATE public.bookings 
SET total_hours = EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
WHERE total_hours IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.bookings 
ALTER COLUMN total_hours SET NOT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN public.bookings.total_hours IS 'Total duration of booking in hours';
