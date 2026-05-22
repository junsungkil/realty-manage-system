// AI 홍보문구 생성 버튼 및 결과 표시 클라이언트 컴포넌트
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, Copy, Check } from 'lucide-react'

interface Props {
  propertyId: string
  initialDescription: string | null
}

export function AiGenerateButton({ propertyId, initialDescription }: Props) {
  const [description, setDescription] = useState(initialDescription ?? '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    })

    if (!res.ok) {
      setError('홍보문구 생성에 실패했습니다. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    const { description: generated } = await res.json()
    setDescription(generated)
    setLoading(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">AI 홍보문구</p>
        <Button
          variant="outline"
          size="sm"
          loading={loading}
          onClick={handleGenerate}
          className="gap-1.5"
        >
          <Sparkles size={14} />
          {description ? '재생성' : 'AI 작성'}
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {description && (
        <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{description}</p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {!description && !loading && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400">
          <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">AI 작성 버튼을 누르면 매물 정보를 분석하여<br />마케팅 문구를 자동 생성합니다.</p>
        </div>
      )}
    </div>
  )
}
