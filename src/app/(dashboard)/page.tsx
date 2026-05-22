// 대시보드 메인 페이지 — 빠른 통계 및 최근 매물
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/property/PropertyCard'
import { Property } from '@/types'
import { Building2, TrendingUp, Clock, CheckCircle2, PlusCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // getSession은 네트워크 요청 없이 쿠키만 읽음
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const admin = createAdminClient()

  const { data: office, error: officeErr } = await admin
    .from('offices')
    .select('id, office_name')
    .eq('owner_id', userId)
    .single()

  const officeId = office?.id ?? ''

  const [
    { count: totalCount },
    { count: availableCount },
    { count: reservedCount },
    { count: completedCount },
    { data: recentProperties },
  ] = await Promise.all([
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'AVAILABLE'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'RESERVED'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'COMPLETED'),
    admin.from('properties').select('*, property_images(*)').eq('office_id', officeId).eq('status', 'AVAILABLE').order('created_at', { ascending: false }).limit(3),
  ])

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Building2 size={40} className="text-slate-300 mb-4" />
        <p className="text-slate-600 font-medium">사무소 정보가 없습니다.</p>
        <p className="text-sm text-slate-400 mt-1">회원가입 시 사무소 정보를 등록해 주세요.</p>
      </div>
    )
  }

  const stats = [
    { label: '전체', value: totalCount ?? 0, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: '진행중', value: availableCount ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '가계약', value: reservedCount ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: '완료', value: completedCount ?? 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' },
  ]

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <p className="text-blue-200 text-sm">안녕하세요</p>
        <h1 className="text-white text-xl font-bold mt-0.5">{office.office_name}</h1>
      </div>

      {/* 통계 카드 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 grid grid-cols-4 gap-3">
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

      {/* 최근 매물 */}
      <div className="px-4 mt-5">
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
