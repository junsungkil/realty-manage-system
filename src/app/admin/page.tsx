// 관리자 대시보드 메인
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Building2, Share2, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const [
    { data: allProperties },
    { data: allOffices },
    { data: allShares },
  ] = await Promise.all([
    admin.from('properties').select('id, status, office_id'),
    admin.from('offices').select('id, office_name, brn, created_at, owner_id'),
    admin.from('property_shares').select('id'),
  ])

  const properties = allProperties ?? []
  const offices = allOffices ?? []

  // 통계 직접 계산
  const totalProperties = properties.length
  const availableProperties = properties.filter((p) => p.status === 'AVAILABLE').length
  const completedProperties = properties.filter((p) => p.status === 'COMPLETED').length
  const totalShares = allShares?.length ?? 0
  const totalUsers = offices.length

  // 사무소별 매물 수 계산 후 내림차순 정렬
  const officePropertyCount = offices.map((o) => ({
    ...o,
    count: properties.filter((p) => p.office_id === o.id).length,
  })).sort((a, b) => b.count - a.count)

  // 최근 가입 사무소 (최신순 5개)
  const recentUsers = [...offices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const stats = [
    { label: '가입 사무소', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/users' },
    { label: '전체 매물', value: totalProperties, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50', href: '/admin/properties' },
    { label: '진행중 매물', value: availableProperties, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/properties?status=AVAILABLE' },
    { label: '완료 매물', value: completedProperties, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/properties?status=COMPLETED' },
    { label: '공유 링크', value: totalShares, icon: Share2, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/properties' },
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
            {recentUsers.length > 0 ? recentUsers.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between">
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

        {/* 사무소별 매물 수 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">사무소별 매물 수</h2>
            <Link href="/admin/properties" className="text-xs text-blue-600">전체 보기</Link>
          </div>
          <div className="flex flex-col divide-y divide-slate-50">
            {officePropertyCount.length > 0 ? officePropertyCount.map((o) => (
              <div key={o.id} className="py-2.5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{o.office_name}</p>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                  {o.count}건
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 py-4 text-center">데이터가 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
