// 매물 검색 바 — 엔터/버튼으로 검색, 기존 필터 파라미터 유지
'use client'

import { useState, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { AdvancedFilterPanel } from './AdvancedFilterPanel'

function SearchBarInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  function handleSearch(q: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(value)
    }
  }

  function handleClear() {
    setValue('')
    handleSearch('')
  }

  return (
    <div className="flex items-center gap-2">
      {/* 검색 입력 */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="주소, 별칭, 동/호수, 메모 검색"
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-100 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 상세 필터 */}
      <AdvancedFilterPanel />
    </div>
  )
}

export function SearchBar() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            disabled
            placeholder="주소, 별칭, 동/호수, 메모 검색"
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 text-sm text-slate-400 outline-none"
          />
        </div>
      </div>
    }>
      <SearchBarInner />
    </Suspense>
  )
}
