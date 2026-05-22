// 가격 표기, 면적 변환 등 공통 유틸리티 함수

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

// 가격을 "억/만원" 단위로 표기 (예: 35000 -> "3억 5천")
export function formatPrice(manwon: number): string {
  if (manwon === 0) return '0'
  const eok = Math.floor(manwon / 10000)
  const remaining = manwon % 10000
  if (eok > 0 && remaining > 0) return `${eok}억 ${remaining.toLocaleString()}만`
  if (eok > 0) return `${eok}억`
  return `${manwon.toLocaleString()}만`
}

// ㎡를 평으로 변환
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm / 3.3058 * 10) / 10
}

// 평을 ㎡로 변환
export function pyeongToSqm(pyeong: number): number {
  return Math.round(pyeong * 3.3058 * 10) / 10
}

// 면적 표기 (예: 33.05 -> "33.05㎡ (10평)")
export function formatArea(sqm: number | null): string {
  if (!sqm) return '-'
  const pyeong = sqmToPyeong(sqm)
  return `${sqm}㎡ (${pyeong}평)`
}

// 거래 유형에 따른 가격 표기
export function formatDealPrice(
  transactionType: string,
  deposit: number,
  monthlyRent: number
): string {
  if (transactionType === '월세') {
    return `${formatPrice(deposit)} / ${monthlyRent.toLocaleString()}만`
  }
  return formatPrice(deposit)
}

// 층수 표기
export function formatFloor(floor: number | null, totalFloors: number | null): string {
  if (!floor) return '-'
  if (totalFloors) return `${floor}/${totalFloors}층`
  return `${floor}층`
}

// 상태 한글 변환
export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: '진행중',
    RESERVED: '가계약',
    COMPLETED: '완료',
  }
  return map[status] ?? status
}

// 상태 배지 색상
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-gray-100 text-gray-600',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}
