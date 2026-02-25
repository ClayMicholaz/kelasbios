-- =====================================================
-- Add WhatsApp field to enrollments table
-- =====================================================
-- This migration adds whatsapp_number field to store contact info
-- and refund status for rejected enrollments

-- Add WhatsApp number column
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Add refund status column
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT NULL CHECK (refund_status IN ('pending', 'processed', NULL));

-- Add refund reason column
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- Add comments
COMMENT ON COLUMN public.enrollments.whatsapp_number IS 'WhatsApp contact number for enrollment communication';
COMMENT ON COLUMN public.enrollments.refund_status IS 'Refund status when payment is rejected: pending or processed';
COMMENT ON COLUMN public.enrollments.refund_reason IS 'Reason for payment rejection and refund';

-- Add index for WhatsApp lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_whatsapp ON public.enrollments(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_enrollments_refund_status ON public.enrollments(refund_status);
