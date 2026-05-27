// 관리자 - 사용자 상세 (사무소별 매물 목록)
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ChevronLeft, Building2, Mail, Hash, CalendarDays, TrendingUp, CheckCircle2, Share2 } from 'lucide-react'
import Link from 'next/link'
import { formatDealPrice } from '@/lib/utils'

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: office } = await admin
    .from('offices')
    .select('*')
    .eq('id', id)
    .single()

  if (!office) notFound()

  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  const authUser = authUsers.find((u) => u.id === office.owner_id)

  const [
    { data: properties },
    { count: shareCount },
  ] = await Promise.all([
    admin.from('properties')
      .select('*, property_images(*), property_shares(view_count)')
      .eq('office_id', id)
      .order('created_at', { ascending: false }),
    admin.from('property_shares')
      .select('*', { count: 'exact', head: true })
      .in('property_id',
        (await admin.from('properties').select('id').eq('office_id', id)).data?.map((p) => p.id) ?? []
      ),
  ])

  const availableCount = properties?.filter((p) => p.status === 'AVAILABLE').length ?? 0
  const completedCount = properties?.filter((p) => p.status === 'COMPLETED').length ?? 0
  const totalViews = properties?.reduce((sum, p) => {
    const shares = p.property_shares as { view_count: number }[] ?? []
    return sum + shares.reduce((s, sh) => s + (sh.view_count ?? 0), 0)
  }, 0) ?? 0

  const dealTypeColor: Record<string, string> = {
    매매: 'bg-blue-100 text-blue-700',
    전세: 'bg-purple-100 text-purple-700',
    월세: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="p-1 text-slate-500">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">{office.office_name}</h1>
      </div>

      {/* 사무소 정보 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail size={14} className="text-slate-400 shrink-0" />
          <span>{authUser?.email ?? '-'}</span>
        </div>
        {office.brn && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Hash size={14} className="text-slate-400 shrink-0" />
            <span>사업자번호 {office.brn}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays size={14} className="text-slate-400 shrink-0" />
          <span>가입일 {new Date(office.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
        {authUser?.last_sign_in_at && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays size={14} className="text-slate-400 shrink-0" />
            <span>최근 로그인 {new Date(authUser.last_sign_in_at).toLocaleDateString('ko-KR')}</span>
          </div>
        )}
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '전체', value: properties?.length ?? 0, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: '진행중', value: availableCount, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '완료', value: completedCount, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '링크조회', value: totalViews, icon: Share2, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
              <Icon size={13} className={color} />
            </div>
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 매물 목록 */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-2">등록 매물 목록</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {properties && properties.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {properties.map((p) => (
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
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{p.address}</p>
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
    </div>
  )
}
