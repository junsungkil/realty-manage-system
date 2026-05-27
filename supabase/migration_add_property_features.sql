-- ============================================================
-- 매물 추가 필드 마이그레이션
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS has_elevator    BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_parking     BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS direction       VARCHAR(20) DEFAULT NULL
    CHECK (direction IN ('남향','남동향','동향','남서향','서향','북향','북동향','북서향')),
  ADD COLUMN IF NOT EXISTS move_in_date    DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS move_in_type    VARCHAR(20) DEFAULT NULL
    CHECK (move_in_type IN ('즉시입주','날짜협의','날짜지정'));

-- 새 필드 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_properties_has_elevator ON properties(has_elevator);
CREATE INDEX IF NOT EXISTS idx_properties_has_parking  ON properties(has_parking);
CREATE INDEX IF NOT EXISTS idx_properties_direction    ON properties(direction);
