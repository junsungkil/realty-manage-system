// 관리자 - 사용자 상세 (사무소별 매물 목록)
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { ChevronLeft, Mail, Hash, CalendarDays, Building2, TrendingUp, CheckCircle2, Share2 } from 'lucide-react'
import Link from 'next/link'
import { AdminUserDetailClient } from './AdminUserDetailClient'

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

  const { data: properties } = await admin
    .from('properties')
    .select('*, property_images(*), property_shares(view_count)')
    .eq('office_id', id)
    .order('created_at', { ascending: false })

  const props = properties ?? []
  const availableCount = props.filter((p) => p.status === 'AVAILABLE').length
  const completedCount = props.filter((p) => p.status === 'COMPLETED').length
  const totalViews = props.reduce((sum, p) => {
    const shares = p.property_shares as { view_count: number }[] ?? []
    return sum + shares.reduce((s, sh) => s + (sh.view_count ?? 0), 0)
  }, 0)

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="p-1 text-slate-500">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">{office.office_name}</h1>
      </div>

      {/* 사무소 기본 정보 (읽기 전용) */}
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
          { label: '전체', value: props.length, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50' },
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

      {/* 클라이언트 컴포넌트: 수정/삭제 UI */}
      <AdminUserDetailClient
        officeId={id}
        officeName={office.office_name}
        brn={office.brn ?? null}
        properties={props.map((p) => ({
          id: p.id,
          title: p.title,
          address: p.address,
          transaction_type: p.transaction_type,
          type: p.type,
          status: p.status,
          deposit: p.deposit,
          monthly_rent: p.monthly_rent,
          created_at: p.created_at,
          property_shares: (p.property_shares as { view_count: number }[]) ?? [],
        }))}
      />
    </div>
  )
}
