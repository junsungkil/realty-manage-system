// 고급 필터 바텀시트 패널
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal } from 'lucide-react'
import { Direction } from '@/types'

const DIRECTIONS: Direction[] = ['남향', '남동향', '동향', '남서향', '서향', '북향', '북동향', '북서향']

interface FilterState {
  area_min: string
  area_max: string
  deposit_min: string
  deposit_max: string
  floor_min: string
  floor_max: string
  has_elevator: '' | 'true' | 'false'
  has_parking: '' | 'true' | 'false'
  direction: Direction | ''
}

function buildInitialState(searchParams: URLSearchParams): FilterState {
  return {
    area_min: searchParams.get('area_min') ?? '',
    area_max: searchParams.get('area_max') ?? '',
    deposit_min: searchParams.get('deposit_min') ?? '',
    deposit_max: searchParams.get('deposit_max') ?? '',
    floor_min: searchParams.get('floor_min') ?? '',
    floor_max: searchParams.get('floor_max') ?? '',
    has_elevator: (searchParams.get('has_elevator') as FilterState['has_elevator']) ?? '',
    has_parking: (searchParams.get('has_parking') as FilterState['has_parking']) ?? '',
    direction: (searchParams.get('direction') as Direction) ?? '',
  }
}

function countActive(searchParams: URLSearchParams) {
  const keys = ['area_min', 'area_max', 'deposit_min', 'deposit_max', 'floor_min', 'floor_max', 'has_elevator', 'has_parking', 'direction']
  return keys.filter((k) => searchParams.get(k)).length
}

// useSearchParams를 사용하는 실제 구현 — Suspense 안에서 렌더링돼야 함
function AdvancedFilterPanelInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterState>(() => buildInitialState(searchParams))
  const activeCount = countActive(searchParams)

  useEffect(() => {
    setFilter(buildInitialState(searchParams))
  }, [searchParams])

  function update<K extends keyof FilterState>(field: K, value: FilterState[K]) {
    setFilter((prev) => ({ ...prev, [field]: value }))
  }

  function applyFilter() {
    const params = new URLSearchParams(searchParams.toString())
    const fields = Object.keys(filter) as (keyof FilterState)[]
    for (const key of fields) {
      if (filter[key]) {
        params.set(key, filter[key])
      } else {
        params.delete(key)
      }
    }
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  function resetFilter() {
    const params = new URLSearchParams(searchParams.toString())
    const fields = ['area_min', 'area_max', 'deposit_min', 'deposit_max', 'floor_min', 'floor_max', 'has_elevator', 'has_parking', 'direction']
    for (const key of fields) params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  return (
    <>
      {/* 필터 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
          activeCount > 0
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-slate-300 text-slate-600'
        }`}
      >
        <SlidersHorizontal size={13} />
        상세필터
        {activeCount > 0 && (
          <span className="ml-0.5 bg-white text-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* 딤 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[59]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 바텀시트 */}
      <div
        className={`fixed bottom-16 left-0 right-0 w-full z-[60] bg-white rounded-t-2xl shadow-xl transition-transform duration-300 flex flex-col max-h-[80vh] overflow-x-hidden ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-900">상세 필터</h2>
          <button type="button" onClick={() => setOpen(false)} className="p-1 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-5 overflow-x-hidden">
          {/* 전용면적 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">전용면적 (㎡)</p>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="number"
                placeholder="최소"
                value={filter.area_min}
                onChange={(e) => update('area_min', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-400 text-sm shrink-0">~</span>
              <input
                type="number"
                placeholder="최대"
                value={filter.area_max}
                onChange={(e) => update('area_max', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 보증금/금액 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">보증금/금액 (만원)</p>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="number"
                placeholder="최소"
                value={filter.deposit_min}
                onChange={(e) => update('deposit_min', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-400 text-sm shrink-0">~</span>
              <input
                type="number"
                placeholder="최대"
                value={filter.deposit_max}
                onChange={(e) => update('deposit_max', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 층수 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">층수 (층)</p>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="number"
                placeholder="최소"
                value={filter.floor_min}
                onChange={(e) => update('floor_min', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-400 text-sm shrink-0">~</span>
              <input
                type="number"
                placeholder="최대"
                value={filter.floor_max}
                onChange={(e) => update('floor_max', e.target.value)}
                className="min-w-0 flex-1 h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 엘리베이터 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">엘리베이터</p>
            <div className="flex gap-2">
              {([
                { value: '' as const, label: '전체' },
                { value: 'true' as const, label: '있음' },
                { value: 'false' as const, label: '없음' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('has_elevator', opt.value)}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
                    filter.has_elevator === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 주차 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">주차</p>
            <div className="flex gap-2">
              {([
                { value: '' as const, label: '전체' },
                { value: 'true' as const, label: '가능' },
                { value: 'false' as const, label: '불가' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('has_parking', opt.value)}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
                    filter.has_parking === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 방향 */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">방향</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update('direction', '')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter.direction === '' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                전체
              </button>
              {DIRECTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => update('direction', filter.direction === d ? '' : d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filter.direction === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 — shrink-0으로 항상 화면에 고정 */}
        <div className="flex gap-3 px-4 py-4 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={resetFilter}
            className="flex-1 h-12 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={applyFilter}
            className="flex-[2] h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            검색하기
          </button>
        </div>
      </div>
    </>
  )
}

// 외부에서 import하는 컴포넌트 — 자체 Suspense로 useSearchParams 오류 방지
export function AdvancedFilterPanel() {
  return (
    <Suspense fallback={
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-600 shrink-0"
      >
        <SlidersHorizontal size={13} />
        상세필터
      </button>
    }>
      <AdvancedFilterPanelInner />
    </Suspense>
  )
}
