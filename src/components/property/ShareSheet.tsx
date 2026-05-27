'use client'

import { useState, useEffect } from 'react'
import {
  Share2, X, Copy, Check, Trash2, Link2, Eye,
} from 'lucide-react'
import { ShareField, SHARE_FIELD_LABELS, DEFAULT_SHARE_FIELDS } from '@/types'

const ALL_FIELDS = Object.keys(SHARE_FIELD_LABELS) as ShareField[]

const EXPIRES_OPTIONS = [
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '무제한', value: null },
]

interface Props {
  propertyId: string
  existingToken?: string | null
  viewCount?: number
}

export function ShareSheet({ propertyId, existingToken, viewCount = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<ShareField[]>(DEFAULT_SHARE_FIELDS)
  const [expiresDays, setExpiresDays] = useState<number | null>(7)
  const [token, setToken] = useState<string | null>(existingToken ?? null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentViewCount, setCurrentViewCount] = useState(viewCount)
  const [origin, setOrigin] = useState('')

  // 클라이언트 마운트 후에만 origin 설정 (hydration 불일치 방지)
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const shareUrl = token && origin
    ? `${origin}/share/${token}`
    : null

  function toggleField(field: ShareField) {
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  async function handleCreate() {
    if (!fields.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, fields, expires_days: expiresDays }),
      })
      const data = await res.json()
      if (data.token) setToken(data.token)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!token) return
    setDeleting(true)
    try {
      await fetch(`/api/share/${token}`, { method: 'DELETE' })
      setToken(null)
      setFields(DEFAULT_SHARE_FIELDS)
      setCurrentViewCount(0)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* 공유 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
      >
        <Share2 size={13} />
        공유
        {token && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" />}
      </button>

      {/* 딤 */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[59]" onClick={() => setOpen(false)} />
      )}

      {/* 바텀시트 */}
      <div className={`fixed bottom-16 left-0 right-0 z-[60] bg-white rounded-t-2xl shadow-xl transition-transform duration-300 flex flex-col max-h-[85vh] ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">공유 링크 설정</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-1 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-5">

          {/* 생성된 링크 표시 */}
          {token && shareUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">생성된 공유 링크</span>
                  <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full">
                    <Eye size={11} />
                    {currentViewCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={12} />
                  {deleting ? '삭제 중...' : '링크 삭제'}
                </button>
              </div>
              <p className="text-xs text-blue-600 break-all font-mono bg-white rounded-lg px-2 py-1.5 border border-blue-100">
                {shareUrl}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {copied ? <><Check size={15} /> 복사됨!</> : <><Copy size={15} /> 링크 복사</>}
              </button>
            </div>
          )}

          {/* 공개 항목 선택 */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-3">공개할 항목 선택</p>
            <div className="flex flex-col gap-0">
              {ALL_FIELDS.map((field) => {
                const isOn = fields.includes(field)
                const isSensitive = field === 'detail_address' || field === 'memo'
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleField(field)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                      isOn ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-800">
                        {SHARE_FIELD_LABELS[field]}
                      </span>
                      {isSensitive && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                          민감
                        </span>
                      )}
                    </div>
                    {/* 토글 */}
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${isOn ? 'bg-blue-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 유효기간 */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-2">유효기간</p>
            <div className="flex gap-2">
              {EXPIRES_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setExpiresDays(opt.value)}
                  className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
                    expiresDays === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 생성 버튼 */}
        <div className="px-4 py-4 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !fields.length}
            className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Link2 size={16} />{token ? '링크 재생성' : '링크 생성'}</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
