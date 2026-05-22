// 대시보드 공통 레이아웃 (하단 네비게이션 포함)
import { BottomNav } from '@/components/ui/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
