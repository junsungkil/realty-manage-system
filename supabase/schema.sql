-- 공인중개사무소 매물 관리 SaaS 데이터베이스 스키마
-- Supabase SQL Editor에서 순서대로 실행하세요.

-- ============================================================
-- 1. 중개사무소 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    office_name VARCHAR(100) NOT NULL,
    brn VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "office_owner_all" ON offices
    FOR ALL USING (owner_id = auth.uid());

-- ============================================================
-- 2. 매물 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('아파트', '빌라', '원룸', '상가', '오피스텔')),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('매매', '전세', '월세')),
    deposit INT DEFAULT 0,
    monthly_rent INT DEFAULT 0,
    maintenance_fee INT DEFAULT 0,
    address VARCHAR(255) NOT NULL,
    detail_address VARCHAR(255),
    exclusive_area NUMERIC(6,2),
    room_count INT DEFAULT 1,
    bathroom_count INT DEFAULT 1,
    floor INT,
    total_floors INT,
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'COMPLETED')),
    memo TEXT,
    ai_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_office_owner" ON properties
    FOR ALL USING (
        office_id IN (SELECT id FROM offices WHERE owner_id = auth.uid())
    );

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. 매물 이미지 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_images_office_owner" ON property_images
    FOR ALL USING (
        property_id IN (
            SELECT p.id FROM properties p
            JOIN offices o ON p.office_id = o.id
            WHERE o.owner_id = auth.uid()
        )
    );

-- ============================================================
-- 4. 인덱스 (성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_office_id ON properties(office_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
