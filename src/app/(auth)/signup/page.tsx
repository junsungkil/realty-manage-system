// 회원가입 및 중개사무소 등록 페이지
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2 } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/Toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    officeName: '',
    brn: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()

    if (form.password.length < 6) {
      showToast('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (form.password !== form.passwordConfirm) {
      showToast('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    const { exists } = await res.json()

    if (exists) {
      showToast('이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.')
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      const msg = signUpError.message.includes('already registered')
        ? '이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요.'
        : '회원가입에 실패했습니다. 다시 시도해주세요.'
      showToast(msg)
      setLoading(false)
      return
    }

    if (!data.user) {
      showToast('이메일 인증이 필요합니다. 받은편지함을 확인해주세요.', 'info')
      setLoading(false)
      return
    }

    const { error: officeError } = await supabase.from('offices').insert({
      owner_id: data.user.id,
      office_name: form.officeName,
      brn: form.brn || null,
    })

    if (officeError) {
      showToast('사무소 정보 저장에 실패했습니다. 다시 시도해주세요.')
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
        <h1 className="text-2xl font-bold text-slate-900">사무소 등록</h1>
        <p className="text-sm text-slate-500 mt-1">
          {step === 1 ? '계정 정보를 입력하세요.' : '중개사무소 정보를 입력하세요.'}
        </p>
      </div>

      <form onSubmit={step === 1 ? handleStep1 : handleSignup}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4"
      >
        {step === 1 ? (
          <>
            <Input
              id="email"
              label="이메일"
              type="email"
              placeholder="office@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            <Input
              id="password"
              label="비밀번호"
              type="password"
              placeholder="6자 이상"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
            <Input
              id="passwordConfirm"
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              다음
            </Button>
          </>
        ) : (
          <>
            <Input
              id="officeName"
              label="중개사무소 이름"
              placeholder="예) 행복부동산"
              value={form.officeName}
              onChange={(e) => update('officeName', e.target.value)}
              required
            />
            <Input
              id="brn"
              label="사업자등록번호 (선택)"
              placeholder="000-00-00000"
              value={form.brn}
              onChange={(e) => update('brn', e.target.value)}
            />

            <div className="flex gap-3 mt-2">
              <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                이전
              </Button>
              <Button type="submit" size="lg" loading={loading} className="flex-1">
                가입 완료
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-600 font-medium">
          로그인
        </Link>
      </p>
    </div>
  )
}
