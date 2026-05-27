-- property_shares 테이블에 조회수 컬럼 추가
ALTER TABLE property_shares
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- 조회수 증가 함수 (race condition 없이 atomic 업데이트)
CREATE OR REPLACE FUNCTION increment_share_view_count(p_token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE property_shares
  SET view_count = view_count + 1
  WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
