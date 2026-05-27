// 관리자 대시보드 메인
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Building2, Share2, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalProperties },
    { count: availableProperties },
    { count: completedProperties },
    { count: totalShares },
    { data: recentUsers },
    { data: topOffices },
  ] = await Promise.all([
    admin.from('offices').select('*', { count: 'exact', head: true }),
    admin.from('properties').select('*', { count: 'exact', head: true }),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'AVAILABLE'),
    admin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
    admin.from('property_shares').select('*', { count: 'exact', head: true }),
    admin.from('offices')
      .select('office_name, brn, created_at, owner_id')
      .order('created_at', { ascending: false })
      .limit(5),
    admin.from('offices')
      .select('id, office_name, properties(count)'),
  ])

  const sortedOffices = (topOffices ?? []).sort((a, b) => {
    const aCount = (a.properties as any)?.[0]?.count ?? 0
    const bCount = (b.properties as any)?.[0]?.count ?? 0
    return bCount - aCount
  })

  const stats = [
    { label: '가입 사무소', value: totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/users' },
    { label: '전체 매물', value: totalProperties ?? 0, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50', href: '/admin/properties' },
    { label: '진행중 매물', value: availableProperties ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/properties?status=AVAILABLE' },
    { label: '완료 매물', value: completedProperties ?? 0, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/properties?status=COMPLETED' },
    { label: '공유 링크', value: totalShares ?? 0, icon: Share2, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/properties' },
  ]

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">관리자 대시보드</h1>
        <p className="text-sm text-slate-500 mt-0.5">전체 서비스 현황을 확인합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 최근 가입 사무소 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">최근 가입 사무소</h2>
            <Link href="/admin/users" className="text-xs text-blue-600">전체 보기</Link>
          </div>
          <div className="flex flex-col divide-y divide-slate-50">
            {recentUsers && recentUsers.length > 0 ? recentUsers.map((u) => (
              <div key={u.owner_id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{u.office_name}</p>
                  <p className="text-xs text-slate-400">{u.brn ?? '사업자번호 없음'}</p>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(u.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            )) : (
              <p className="text-sm text-slate-400 py-4 text-center">가입된 사무소가 없습니다</p>
            )}
          </div>
        </div>

        {/* 매물 등록 현황 (사무소별) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">사무소별 매물 수</h2>
            <Link href="/admin/properties" className="text-xs text-blue-600">전체 보기</Link>
          </div>
          <div className="flex flex-col divide-y divide-slate-50">
            {sortedOffices.length > 0 ? sortedOffices.map((o) => {
              const count = (o.properties as any)?.[0]?.count ?? 0
              return (
                <div key={o.id} className="py-2.5 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{o.office_name}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                    {count}건
                  </span>
                </div>
              )
            }) : (
              <p className="text-sm text-slate-400 py-4 text-center">데이터가 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
