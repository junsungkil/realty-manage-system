'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'

export function CopyPropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCopy() {
    if (loading) return
    if (!confirm('이 매물을 복사하시겠습니까?\n"(복사본)" 제목으로 새 매물이 등록됩니다.')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/copy`, { method: 'POST' })
      const data = await res.json()
      if (data.id) {
        router.push(`/properties/${data.id}/edit`)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={loading}
      className="p-2 text-slate-500 disabled:opacity-40"
      title="매물 복사"
    >
      {loading
        ? <span className="w-[18px] h-[18px] border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin inline-block" />
        : <Copy size={18} />
      }
    </button>
  )
}
