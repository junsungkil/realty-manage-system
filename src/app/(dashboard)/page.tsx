// 대시보드 메인 페이지 — 빠른 통계 및 최근 매물
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/property/PropertyCard'
import { Property } from '@/types'
import { Building2, TrendingUp, CheckCircle2, PlusCircle, BarChart3 } from 'lucide-react'

// 간단한 가로 바 차트 컴포넌트
function BarChart({
  data,
  colorClass,
}: {
  data: { label: string; value: number; total: number }[]
  colorClass?: string
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.map(({ label, value, total }) => {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0
        return (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16 shrink-0 text-right">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full flex items-center justify-end pr-2 transition-all ${colorClass ?? 'bg-blue-500'}`}
                style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
              >
                {pct >= 15 && (
                  <span className="text-[10px] text-white font-semibold">{pct}%</span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 w-6 text-right">{value}</span>
          </div>
        )
      })}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const admin = createAdminClient()

  const { data: office } = await admin
    .from('offices')
    .select('id, office_name')
    .eq('owner_id', userId)
    .single()

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Building2 size={40} className="text-slate-300 mb-4" />
        <p className="text-slate-600 font-medium">사무소 정보가 없습니다.</p>
      </div>
    )
  }

  const officeId = office.id

  // 현재 월 범위
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [
    { count: totalCount },
    { count: availableCount },
    { count: completedCount },
    { data: allProperties },
    { count: thisMonthCount },
    { count: lastMonthCount },
    { data: recentProperties },
  ] = await Promise.all([
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'AVAILABLE'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'COMPLETED'),
    admin.from('properties').select('transaction_type, type').eq('office_id', officeId),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).gte('created_at', thisMonthStart),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).gte('created_at', lastMonthStart).lt('created_at', thisMonthStart),
    admin.from('properties').select('*, property_images(*)').eq('office_id', officeId).eq('status', 'AVAILABLE').order('created_at', { ascending: false }).limit(3),
  ])

  // 거래유형별 집계
  const total = totalCount ?? 0
  const byTransaction = ['월세', '전세', '매매'].map((t) => ({
    label: t,
    value: allProperties?.filter((p) => p.transaction_type === t).length ?? 0,
    total,
  }))

  // 매물유형별 집계
  const byType = ['원룸', '아파트', '빌라', '오피스텔', '상가'].map((t) => ({
    label: t,
    value: allProperties?.filter((p) => p.type === t).length ?? 0,
    total,
  })).filter((d) => d.value > 0)

  const stats = [
    { label: '전체', value: total, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: '진행중', value: availableCount ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '완료', value: completedCount ?? 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
  ]

  const monthDiff = (thisMonthCount ?? 0) - (lastMonthCount ?? 0)

  return (
    <div className="flex flex-col pb-4">
      {/* 헤더 */}
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <p className="text-blue-200 text-sm">안녕하세요</p>
        <h1 className="text-white text-xl font-bold mt-0.5">{office.office_name}</h1>
      </div>

      {/* 요약 통계 카드 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <span className="text-lg font-bold text-slate-900">{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 이번달 등록 현황 */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">이번 달 신규 등록</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {thisMonthCount ?? 0}
              <span className="text-sm font-normal text-slate-500 ml-1">건</span>
            </p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
            monthDiff > 0 ? 'bg-green-50 text-green-600' :
            monthDiff < 0 ? 'bg-red-50 text-red-500' :
            'bg-slate-100 text-slate-500'
          }`}>
            {monthDiff > 0 ? `▲ ${monthDiff}` : monthDiff < 0 ? `▼ ${Math.abs(monthDiff)}` : '–'}
            <span className="text-xs font-normal">전월 대비</span>
          </div>
        </div>
      </div>

      {/* 거래 유형별 분포 */}
      {total > 0 && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800">거래 유형별</h2>
            </div>
            <BarChart data={byTransaction} colorClass="bg-blue-500" />
          </div>
        </div>
      )}

      {/* 매물 유형별 분포 */}
      {byType.length > 0 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-purple-500" />
              <h2 className="text-sm font-bold text-slate-800">매물 유형별</h2>
            </div>
            <BarChart data={byType} colorClass="bg-purple-500" />
          </div>
        </div>
      )}

      {/* 최근 매물 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">진행중인 매물</h2>
          <Link href="/properties" className="text-sm text-blue-600 font-medium">
            전체 보기
          </Link>
        </div>

        {recentProperties && recentProperties.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentProperties.map((p) => (
              <PropertyCard key={p.id} property={p as Property} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <PlusCircle size={32} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">등록된 매물이 없습니다.</p>
            <Link href="/properties/create" className="mt-3 text-sm text-blue-600 font-medium">
              첫 매물 등록하기
            </Link>
          </div>
        )}
      </div>

      {/* 빠른 등록 버튼 */}
      <div className="px-4 mt-4">
        <Link
          href="/properties/create"
          className="flex items-center justify-center gap-2 w-full h-12 bg-blue-600 text-white rounded-2xl font-medium text-sm active:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} />
          새 매물 등록
        </Link>
      </div>
    </div>
  )
}
