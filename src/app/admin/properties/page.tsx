// 관리자 - 전체 매물 목록
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import { Building2 } from 'lucide-react'
import { formatDealPrice } from '@/lib/utils'

interface SearchParams {
  status?: string
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status } = await searchParams
  const admin = createAdminClient()

  let query = admin
    .from('properties')
    .select('*, offices(office_name), property_shares(view_count)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: properties } = await query

  const dealTypeColor: Record<string, string> = {
    매매: 'bg-blue-100 text-blue-700',
    전세: 'bg-purple-100 text-purple-700',
    월세: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">전체 매물 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">모든 사무소의 매물을 조회합니다</p>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          총 {properties?.length ?? 0}건
        </span>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2">
        {[
          { label: '전체', value: '' },
          { label: '진행중', value: 'AVAILABLE' },
          { label: '완료', value: 'COMPLETED' },
        ].map((opt) => (
          <a
            key={opt.value}
            href={`/admin/properties${opt.value ? `?status=${opt.value}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              (status ?? '') === opt.value
                ? 'bg-slate-800 border-slate-800 text-white'
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {/* 매물 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {properties && properties.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {properties.map((p) => {
              const office = p.offices as { office_name: string } | null
              const shares = p.property_shares as { view_count: number }[] ?? []
              const totalViews = shares.reduce((s, sh) => s + (sh.view_count ?? 0), 0)

              return (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${dealTypeColor[p.transaction_type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.transaction_type}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.type}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.status === 'AVAILABLE' ? '진행중' : '완료'}
                      </span>
                      {totalViews > 0 && (
                        <span className="text-[10px] text-orange-500">👁 {totalViews}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 truncate">{p.address}</p>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-0.5">{office?.office_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-600">
                      {formatDealPrice(p.transaction_type, p.deposit, p.monthly_rent)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">만원</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Building2 size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">매물이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
