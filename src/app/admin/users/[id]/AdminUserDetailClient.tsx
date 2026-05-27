'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Pencil, Trash2, X, Check, ExternalLink } from 'lucide-react'
import { formatDealPrice } from '@/lib/utils'

interface Property {
  id: string
  title: string
  address: string
  transaction_type: string
  type: string
  status: string
  deposit: number | null | undefined
  monthly_rent: number | null | undefined
  created_at: string
  property_shares: { view_count: number }[]
}

interface Props {
  officeId: string
  officeName: string
  brn: string | null
  properties: Property[]
}

const dealTypeColor: Record<string, string> = {
  매매: 'bg-blue-100 text-blue-700',
  전세: 'bg-purple-100 text-purple-700',
  월세: 'bg-orange-100 text-orange-700',
}

export function AdminUserDetailClient({ officeId, officeName, brn, properties }: Props) {
  const router = useRouter()

  // 사무소 수정 상태
  const [editingOffice, setEditingOffice] = useState(false)
  const [editName, setEditName] = useState(officeName)
  const [editBrn, setEditBrn] = useState(brn ?? '')
  const [officeLoading, setOfficeLoading] = useState(false)

  // 매물 삭제 확인 상태
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null)
  const [deletingOffice, setDeletingOffice] = useState(false)

  async function handleSaveOffice() {
    setOfficeLoading(true)
    const res = await fetch(`/api/admin/offices/${officeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ office_name: editName, brn: editBrn || null }),
    })
    setOfficeLoading(false)
    if (res.ok) {
      setEditingOffice(false)
      router.refresh()
    } else {
      alert('수정 실패')
    }
  }

  async function handleDeleteOffice() {
    if (!confirm(`"${officeName}" 사무소를 삭제하면 관련 매물 ${properties.length}건도 모두 삭제됩니다. 계속하시겠습니까?`)) return
    setDeletingOffice(true)
    const res = await fetch(`/api/admin/offices/${officeId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/users')
      router.refresh()
    } else {
      setDeletingOffice(false)
      alert('삭제 실패')
    }
  }

  async function handleDeleteProperty(propertyId: string) {
    const res = await fetch(`/api/admin/properties/${propertyId}`, { method: 'DELETE' })
    if (res.ok) {
      setDeletingPropertyId(null)
      router.refresh()
    } else {
      alert('삭제 실패')
    }
  }

  return (
    <>
      {/* 사무소 정보 카드 - 수정/삭제 버튼 포함 */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">사무소 정보</h2>
        <div className="flex gap-1.5">
          {!editingOffice && (
            <>
              <button
                onClick={() => setEditingOffice(true)}
                className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg"
              >
                <Pencil size={12} /> 수정
              </button>
              <button
                onClick={handleDeleteOffice}
                disabled={deletingOffice}
                className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-lg disabled:opacity-50"
              >
                <Trash2 size={12} /> {deletingOffice ? '삭제중...' : '삭제'}
              </button>
            </>
          )}
        </div>
      </div>

      {editingOffice && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">사무소명</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">사업자번호</label>
            <input
              value={editBrn}
              onChange={(e) => setEditBrn(e.target.value)}
              placeholder="선택 입력"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveOffice}
              disabled={officeLoading}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-medium py-2 rounded-xl disabled:opacity-50"
            >
              <Check size={14} /> {officeLoading ? '저장중...' : '저장'}
            </button>
            <button
              onClick={() => { setEditingOffice(false); setEditName(officeName); setEditBrn(brn ?? '') }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 text-sm font-medium py-2 rounded-xl"
            >
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      {/* 매물 목록 */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-2">등록 매물 목록</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {properties.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {properties.map((p) => (
                <div key={p.id} className="px-4 py-3">
                  {deletingPropertyId === p.id ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-slate-700">정말 삭제하시겠습니까?</p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleDeleteProperty(p.id)}
                          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setDeletingPropertyId(null)}
                          className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${dealTypeColor[p.transaction_type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {p.transaction_type}
                          </span>
                          <span className="text-[10px] text-slate-400">{p.type}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {p.status === 'AVAILABLE' ? '진행중' : '완료'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{p.address}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">
                            {formatDealPrice(p.transaction_type, p.deposit ?? 0, p.monthly_rent ?? 0)}
                            <span className="text-[10px] text-slate-400 font-normal ml-0.5">만원</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(p.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <a
                            href={`/properties/${p.id}/edit?from=admin`}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600"
                            title="수정"
                          >
                            <Pencil size={13} />
                          </a>
                          <button
                            onClick={() => setDeletingPropertyId(p.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500"
                            title="삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Building2 size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">등록된 매물이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
