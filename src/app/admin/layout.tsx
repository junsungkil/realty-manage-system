// 관리자 레이아웃
import Link from 'next/link'
import { LayoutDashboard, Users, Building2, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 네비게이션 */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-blue-400" />
          <span className="font-bold text-sm">매물관리 · 관리자</span>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={13} />
            대시보드
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users size={13} />
            사용자
          </Link>
          <Link
            href="/admin/properties"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Building2 size={13} />
            매물
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors ml-2 border border-slate-700"
          >
            <LogOut size={13} />
            앱으로
          </Link>
        </nav>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  )
}
