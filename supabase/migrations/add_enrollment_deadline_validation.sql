-- =====================================================
-- Add Enrollment Deadline Validation
-- =====================================================
-- This migration adds database-level validation to prevent
-- enrollments after registration deadline has passed

-- =====================================================
-- 1. CREATE TRIGGER FUNCTION TO VALIDATE DEADLINE
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_enrollment_deadline()
RETURNS TRIGGER AS $$
DECLARE
  class_deadline TIMESTAMPTZ;
  class_status VARCHAR(20);
BEGIN
  -- Get the registration deadline and status for the class
  SELECT registration_deadline, status
  INTO class_deadline, class_status
  FROM public.classes
  WHERE id = NEW.class_id;

  -- Check if registration deadline exists
  IF class_deadline IS NULL THEN
    RAISE EXCEPTION 'Class does not have a registration deadline set';
  END IF;

  -- Check if deadline has passed
  IF NOW() > class_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed. Cannot enroll in this class.';
  END IF;

  -- Check if class is still open
  IF class_status != 'open' THEN
    RAISE EXCEPTION 'Class is not open for enrollment. Current status: %', class_status;
  END IF;

  -- Check if class is full
  DECLARE
    current_count INTEGER;
    max_count INTEGER;
  BEGIN
    SELECT max_participants INTO max_count
    FROM public.classes
    WHERE id = NEW.class_id;

    SELECT COUNT(*)
    INTO current_count
    FROM public.enrollments
    WHERE class_id = NEW.class_id 
      AND payment_status IN ('verified', 'pending');

    IF current_count >= max_count THEN
      RAISE EXCEPTION 'Class is full. Maximum participants: %', max_count;
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. CREATE TRIGGER ON ENROLLMENTS TABLE
-- =====================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS check_enrollment_deadline ON public.enrollments;

-- Create trigger that runs BEFORE INSERT
CREATE TRIGGER check_enrollment_deadline
  BEFORE INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_enrollment_deadline();

-- =====================================================
-- 3. ADD COMMENT FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.validate_enrollment_deadline() IS 
  'Validates that enrollment happens before registration deadline and class is still open and not full';

COMMENT ON TRIGGER check_enrollment_deadline ON public.enrollments IS
  'Prevents enrollment after deadline, when class is closed, or when class is full';

-- =====================================================
-- 4. TEST THE TRIGGER (Optional - Comment out in production)
-- =====================================================

-- To test: Try to insert an enrollment for a class with expired deadline
-- It should fail with error message
-- Example:
-- INSERT INTO public.enrollments (user_id, class_id, payment_status)
-- VALUES ('your-user-id', 'class-with-expired-deadline', 'pending');
-- Expected: ERROR: Registration deadline has passed. Cannot enroll in this class.
