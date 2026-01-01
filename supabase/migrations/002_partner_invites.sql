-- Partner Invites Table
-- Handles invitation codes for partner linking

CREATE TABLE IF NOT EXISTS partner_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),

  -- One active invite per user
  CONSTRAINT one_active_invite_per_user UNIQUE (user_id, used)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_invites_code ON partner_invites(code);
CREATE INDEX IF NOT EXISTS idx_partner_invites_user_id ON partner_invites(user_id);

-- RLS Policies
ALTER TABLE partner_invites ENABLE ROW LEVEL SECURITY;

-- Users can create/update their own invites
CREATE POLICY "Users can manage own invites"
  ON partner_invites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone authenticated can read invites by code (for accepting)
CREATE POLICY "Authenticated users can read invites by code"
  ON partner_invites
  FOR SELECT
  USING (auth.role() = 'authenticated');
