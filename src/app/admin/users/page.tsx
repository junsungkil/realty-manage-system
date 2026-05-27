// 관리자 - 사용자(사무소) 목록
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import { Users, Building2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const { data: offices } = await admin
    .from('offices')
    .select(`
      id,
      owner_id,
      office_name,
      brn,
      created_at,
      properties(count)
    `)
    .order('created_at', { ascending: false })

  // auth.users에서 이메일 조회
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email ?? '']))
  const lastSignInMap = new Map(authUsers.map((u) => [u.id, u.last_sign_in_at ?? '']))

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">사용자 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">가입된 사무소 목록</p>
        </div>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          총 {offices?.length ?? 0}개
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {offices && offices.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {offices.map((office) => {
              const email = emailMap.get(office.owner_id) ?? '-'
              const lastSignIn = lastSignInMap.get(office.owner_id)
              const propertyCount = (office.properties as any)?.[0]?.count ?? 0

              return (
                <Link key={office.id} href={`/admin/users/${office.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{office.office_name}</p>
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          매물 {propertyCount}건
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-400">
                          가입 {new Date(office.created_at).toLocaleDateString('ko-KR')}
                        </p>
                        {lastSignIn && (
                          <p className="text-[10px] text-slate-400">
                            · 최근로그인 {new Date(lastSignIn).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users size={32} className="mb-2 opacity-40" />
            <p className="text-sm">가입된 사용자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
