-- ============================================================
-- 매물 공유 링크 테이블
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

CREATE TABLE IF NOT EXISTS property_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  token       VARCHAR(12) UNIQUE NOT NULL,
  fields      JSONB NOT NULL DEFAULT '[]',
  expires_at  TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 토큰으로 빠르게 조회
CREATE INDEX IF NOT EXISTS idx_property_shares_token ON property_shares(token);
CREATE INDEX IF NOT EXISTS idx_property_shares_property_id ON property_shares(property_id);

-- RLS: 공유 페이지는 토큰만 알면 누구나 읽기 가능 (로그인 불필요)
ALTER TABLE property_shares ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나 (공개 링크)
CREATE POLICY "shares_public_read" ON property_shares
  FOR SELECT USING (true);

-- 쓰기: 해당 매물 소유자만
CREATE POLICY "shares_owner_insert" ON property_shares
  FOR INSERT WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN offices o ON p.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );

CREATE POLICY "shares_owner_delete" ON property_shares
  FOR DELETE USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN offices o ON p.office_id = o.id
      WHERE o.owner_id = auth.uid()
    )
  );
