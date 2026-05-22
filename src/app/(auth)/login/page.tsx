'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toast, useToast } from '@/components/ui/Toast'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      showToast('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="w-full max-w-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
          <Building2 size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">매물관리</h1>
        <p className="text-sm text-slate-500 mt-1">중개사무소 전용 매물 관리 시스템</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <Input
          id="email"
          label="이메일"
          type="email"
          placeholder="office@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
          로그인
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-blue-600 font-medium">
          회원가입
        </Link>
      </p>
    </div>
  )
}
