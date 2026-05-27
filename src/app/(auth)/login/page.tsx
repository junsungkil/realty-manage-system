'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Toast, useToast } from '@/components/ui/Toast'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'

const SAVED_EMAIL_KEY = 'saved_email'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saveId, setSaveId] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  // 저장된 이메일 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setSaveId(true)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // ID 저장 처리
    if (saveId) {
      localStorage.setItem(SAVED_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      showToast('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
          >
            <Building2 size={30} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white/20" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">매물관리</h1>
        <p className="text-sm text-blue-200 mt-1">공인중개사 전용 매물 관리 시스템</p>
      </div>

      {/* 카드 */}
      <div className="w-full rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-5">로그인</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-blue-200">이메일</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
              <input
                type="email"
                placeholder="office@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-blue-300/50 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.7)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-blue-200">비밀번호</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-blue-300/50 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.7)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>
          </div>

          {/* ID 저장 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setSaveId((v) => !v)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                saveId
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-white/30 bg-white/5'
              }`}
            >
              {saveId && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs text-blue-200">이메일 저장</span>
          </label>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                로그인
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* 회원가입 링크 */}
      <p className="text-center text-sm text-blue-200 mt-5">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-white font-semibold underline underline-offset-2">
          회원가입
        </Link>
      </p>
    </div>
  )
}
