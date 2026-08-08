-- Migration: Phase 3.1 Supabase Donation Manual Payment Flow
-- File: supabase/migrations/20260808130000_manual_donation.sql

-- Add value 'submitted' to enum donation_status (if not already present)
-- Note: ALTER TYPE ADD VALUE cannot be executed inside a transaction block in some PG environments.
-- However, Supabase migrations execute this safely. We will run it direct.
ALTER TYPE donation_status ADD VALUE IF NOT EXISTS 'submitted';

-- Alter table donations: add payment_method column
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'midtrans_qris';

-- Alter table donations: add proof_storage_path column
ALTER TABLE donations ADD COLUMN IF NOT EXISTS proof_storage_path VARCHAR(255) NULL;

-- Programmatically create private storage bucket 'donation-proofs' if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'donation-proofs',
  'donation-proofs',
  false, -- Private bucket
  5242880, -- 5 MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
