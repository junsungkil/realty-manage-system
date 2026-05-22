// 매물 목록 필터 바 컴포넌트
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TransactionType, PropertyType, PropertyStatus } from '@/types'

const transactionTabs: { value: TransactionType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: '매매', label: '매매' },
  { value: '전세', label: '전세' },
  { value: '월세', label: '월세' },
]

const typeOptions: { value: PropertyType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: '아파트', label: '아파트' },
  { value: '빌라', label: '빌라' },
  { value: '원룸', label: '원룸' },
  { value: '오피스텔', label: '오피스텔' },
  { value: '상가', label: '상가' },
]

const statusOptions: { value: PropertyStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'AVAILABLE', label: '진행중' },
  { value: 'RESERVED', label: '가계약' },
  { value: 'COMPLETED', label: '완료' },
]

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTransaction = searchParams.get('transaction') ?? 'ALL'
  const currentType = searchParams.get('type') ?? 'ALL'
  const currentStatus = searchParams.get('status') ?? 'ALL'

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-slate-100">
      {/* 거래 유형 탭 */}
      <div className="flex border-b border-slate-100">
        {transactionTabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter('transaction', value)}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              currentTransaction === value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 매물 유형 + 상태 필터 */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {typeOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter('type', value)}
            className={cn(
              'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
              currentType === value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600'
            )}
          >
            {label}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1 shrink-0" />
        {statusOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter('status', value)}
            className={cn(
              'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
              currentStatus === value
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
