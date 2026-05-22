// 모바일 하단 탭 네비게이션
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, PlusCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/properties', label: '매물', icon: Building2 },
  { href: '/properties/create', label: '등록', icon: PlusCircle, highlight: true },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full',
                'text-xs font-medium transition-colors',
                highlight
                  ? 'text-blue-600'
                  : isActive
                  ? 'text-blue-600'
                  : 'text-slate-500'
              )}
            >
              <Icon
                size={highlight ? 28 : 22}
                className={highlight && isActive ? 'text-blue-700' : ''}
                strokeWidth={highlight ? 2.5 : isActive ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium text-slate-500"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span>로그아웃</span>
        </button>
      </div>
    </nav>
  )
}
