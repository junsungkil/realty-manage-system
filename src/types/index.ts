// 프로젝트 전체에서 사용하는 TypeScript 타입 정의

export type PropertyType = '아파트' | '빌라' | '원룸' | '상가' | '오피스텔'
export type TransactionType = '매매' | '전세' | '월세'
export type PropertyStatus = 'AVAILABLE' | 'COMPLETED'
export type Direction = '남향' | '남동향' | '동향' | '남서향' | '서향' | '북향' | '북동향' | '북서향'
export type MoveInType = '즉시입주' | '날짜협의' | '날짜지정'

export interface Office {
  id: string
  owner_id: string
  office_name: string
  brn: string | null
  created_at: string
}

export interface Property {
  id: string
  office_id: string
  title: string
  type: PropertyType
  transaction_type: TransactionType
  deposit: number
  monthly_rent: number
  maintenance_fee: number
  address: string
  detail_address: string | null
  exclusive_area: number | null
  room_count: number
  bathroom_count: number
  floor: number | null
  total_floors: number | null
  status: PropertyStatus
  memo: string | null
  // 추가 필드
  has_elevator: boolean | null
  has_parking: boolean | null
  direction: Direction | null
  move_in_type: MoveInType | null
  move_in_date: string | null
  tags: string[]
  created_at: string
  updated_at: string
  property_images?: PropertyImage[]
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  is_thumbnail: boolean
  created_at: string
}

export interface PropertyFormData {
  title: string
  type: PropertyType
  transaction_type: TransactionType
  deposit: number
  monthly_rent: number
  maintenance_fee: number
  address: string
  detail_address: string
  exclusive_area: string
  room_count: number | string
  bathroom_count: number | string
  floor: string
  total_floors: string
  memo: string
  // 추가 필드
  has_elevator: boolean
  has_parking: boolean
  direction: Direction | ''
  move_in_type: MoveInType | ''
  move_in_date: string
  tags: string[]
}

export interface PropertyFilter {
  transaction_type?: TransactionType
  type?: PropertyType
  status?: PropertyStatus
  search?: string
  // 고급 필터
  has_elevator?: boolean
  has_parking?: boolean
  direction?: Direction
  area_min?: number
  area_max?: number
  deposit_min?: number
  deposit_max?: number
  floor_min?: number
  floor_max?: number
}

// 평수 변환 유틸 타입
export type AreaUnit = '평' | '㎡'

// 가격 표기 유틸
export type PriceUnit = '만원' | '억'

// ── 매물 공유 링크
export type ShareField =
  | 'price'          // 가격 정보
  | 'address'        // 주소 (도로명)
  | 'detail_address' // 상세주소 (동/호수)
  | 'area'           // 전용면적
  | 'floor'          // 층수
  | 'rooms'          // 방수/욕실수
  | 'elevator'       // 엘리베이터
  | 'parking'        // 주차
  | 'direction'      // 방향
  | 'move_in'        // 입주가능일
  | 'images'         // 사진
  | 'memo'           // 비고/추가사항
  | 'office'         // 사무소 정보

export interface PropertyShare {
  id: string
  property_id: string
  token: string
  fields: ShareField[]
  expires_at: string | null
  created_at: string
}

export const SHARE_FIELD_LABELS: Record<ShareField, string> = {
  price:          '가격 정보',
  address:        '주소',
  detail_address: '상세주소 (동/호수)',
  area:           '전용면적',
  floor:          '층수',
  rooms:          '방수 / 욕실수',
  elevator:       '엘리베이터',
  parking:        '주차',
  direction:      '방향',
  move_in:        '입주 가능일',
  images:         '사진',
  memo:           '비고 / 추가사항',
  office:         '사무소 정보',
}

// 기본 ON 필드 (민감정보 기본 OFF)
export const DEFAULT_SHARE_FIELDS: ShareField[] = [
  'price', 'address', 'area', 'floor', 'rooms',
  'elevator', 'parking', 'direction', 'move_in', 'images', 'office',
]
