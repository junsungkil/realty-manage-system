'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Download } from 'lucide-react'

function ExportButtonInner() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      // 현재 필터(상태/거래유형/매물유형)를 유지해서 내보내기
      const params = new URLSearchParams()
      const status = searchParams.get('status')
      const transaction_type = searchParams.get('transaction_type')
      const type = searchParams.get('type')
      if (status) params.set('status', status)
      if (transaction_type) params.set('transaction_type', transaction_type)
      if (type) params.set('type', type)

      const url = `/api/properties/export?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) return

      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      const cd = res.headers.get('content-disposition') ?? ''
      const match = cd.match(/filename\*=UTF-8''(.+)/)
      a.download = match ? decodeURIComponent(match[1]) : '매물목록.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 bg-white text-slate-600 disabled:opacity-50 shrink-0"
      title="엑셀 내보내기"
    >
      {loading
        ? <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
        : <Download size={13} />
      }
      내보내기
    </button>
  )
}

export function ExportButton() {
  return (
    <Suspense fallback={
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 bg-white text-slate-600 shrink-0">
        <Download size={13} />
        내보내기
      </button>
    }>
      <ExportButtonInner />
    </Suspense>
  )
}
