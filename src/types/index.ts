// 프로젝트 전체에서 사용하는 TypeScript 타입 정의

export type PropertyType = '아파트' | '빌라' | '원룸' | '상가' | '오피스텔'
export type TransactionType = '매매' | '전세' | '월세'
export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'COMPLETED'

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
  ai_description: string | null
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
  room_count: number
  bathroom_count: number
  floor: string
  total_floors: string
  memo: string
}

export interface PropertyFilter {
  transaction_type?: TransactionType
  type?: PropertyType
  status?: PropertyStatus
  search?: string
}

// 평수 변환 유틸 타입
export type AreaUnit = '평' | '㎡'

// 가격 표기 유틸
export type PriceUnit = '만원' | '억'
