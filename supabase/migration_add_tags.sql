-- properties 테이블에 태그 배열 컬럼 추가
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 태그 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_properties_tags ON properties USING GIN (tags);
