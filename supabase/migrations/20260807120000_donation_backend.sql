-- Migration: Phase 2 Supabase Donation Backend
-- File: supabase/migrations/20260807120000_donation_backend.sql

CREATE TYPE donation_status AS ENUM ('pending', 'paid', 'expired', 'failed');

-- Table: donations (Private, server-managed)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(64) UNIQUE NOT NULL,
  donor_name VARCHAR(100) NOT NULL,
  donor_email VARCHAR(255) NULL,
  amount INTEGER NOT NULL CHECK (amount >= 1000 AND amount <= 10000000),
  message VARCHAR(150) NULL,
  show_public_name BOOLEAN NOT NULL DEFAULT FALSE,
  show_public_message BOOLEAN NOT NULL DEFAULT FALSE,
  status donation_status NOT NULL DEFAULT 'pending',
  midtrans_transaction_id VARCHAR(100) NULL,
  qris_url TEXT NULL,
  qris_string TEXT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ NULL
);

-- Table: public_donations (Sanitized projection for public clients & realtime)
CREATE TABLE public_donations (
  id UUID PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  message VARCHAR(150) NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: donations (Access restricted to Server-Only Service Role)
CREATE POLICY "Block all public access on donations" ON donations
  FOR ALL TO public USING (false) WITH CHECK (false);

-- RLS Policies: public_donations (Read-only for public, modifications blocked)
CREATE POLICY "Allow public select on public_donations" ON public_donations
  FOR SELECT TO public USING (true);

CREATE POLICY "Block all public modifications on public_donations" ON public_donations
  FOR ALL TO public USING (false) WITH CHECK (false);

-- Indexing for optimized operations
CREATE INDEX idx_donations_order_id ON donations(order_id);
CREATE INDEX idx_public_donations_paid_at ON public_donations(paid_at DESC);

-- Trigger function to populate public_donations upon verified payment
CREATE OR REPLACE FUNCTION handle_donation_paid_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    INSERT INTO public_donations (id, display_name, amount, message, paid_at)
    VALUES (
      NEW.id,
      CASE WHEN NEW.show_public_name THEN NEW.donor_name ELSE 'Donatur Anonim' END,
      NEW.amount,
      CASE WHEN NEW.show_public_message THEN NEW.message ELSE NULL END,
      COALESCE(NEW.paid_at, NOW())
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_donation_paid
  AFTER UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION handle_donation_paid_trigger();

-- Setup Realtime Publication for public_donations changes
ALTER PUBLICATION supabase_realtime ADD TABLE public_donations;
