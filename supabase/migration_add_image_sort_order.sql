-- property_images 테이블에 정렬 순서 컬럼 추가
ALTER TABLE property_images
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 기존 이미지 순서 초기화 (is_thumbnail=true를 0번으로)
UPDATE property_images SET sort_order = 0 WHERE is_thumbnail = true;
