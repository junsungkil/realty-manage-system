'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Toast, useToast } from '@/components/ui/Toast'
import {
  Building2, Mail, Lock, ChevronLeft, ChevronRight,
  Store, CheckCircle2, XCircle, Loader2, Hash,
} from 'lucide-react'

// ── 사업자등록번호 형식 포맷 (000-00-00000)
function formatBrn(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

// ── 국세청 사업자등록번호 유효성 검사 알고리즘
// 가중치 합 + floor(d[8]*5/10) + 마지막자리 가 10의 배수면 유효
function validateBrn(brn: string): boolean {
  const d = brn.replace(/\D/g, '')
  if (d.length !== 10) return false
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * w[i]
  sum += Math.floor(Number(d[8]) * 5 / 10)
  return (sum + Number(d[9])) % 10 === 0
}

// ── 입력 필드 컴포넌트
type FieldStatus = 'idle' | 'checking' | 'ok' | 'error'

function Field({
  label, hint, icon: Icon, status, message, children,
}: {
  label: string
  hint?: string
  icon: React.ElementType
  status?: FieldStatus
  message?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-blue-200">{label}</label>
        {hint && <span className="text-[11px] text-blue-300/60">{hint}</span>}
      </div>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none z-10" />
        {children}
        {/* 상태 아이콘 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {status === 'checking' && <Loader2 size={15} className="text-blue-300 animate-spin" />}
          {status === 'ok'       && <CheckCircle2 size={15} className="text-emerald-400" />}
          {status === 'error'    && <XCircle size={15} className="text-red-400" />}
        </div>
      </div>
      {message && (
        <p className={`text-[11px] ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

// ── 공통 input 스타일
const inputBase = "w-full h-12 pl-10 pr-9 rounded-xl text-sm text-white placeholder:text-blue-300/50 outline-none transition-all"
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,0.15)',
}
const focusBorder = 'rgba(96,165,250,0.7)'
const blurBorder  = 'rgba(255,255,255,0.15)'
const errorBorder = 'rgba(248,113,113,0.7)'
const okBorder    = 'rgba(52,211,153,0.5)'

function borderOf(status?: FieldStatus) {
  if (status === 'error') return errorBorder
  if (status === 'ok')    return okBorder
  return blurBorder
}

// ── 디바운스 훅
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const { toast, showToast, closeToast } = useToast()

  // ── 폼 값
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [officeName, setOfficeName]     = useState('')
  const [brn, setBrn]                   = useState('')          // 표시용 (포맷됨)

  // ── 검증 상태
  const [emailStatus,  setEmailStatus]  = useState<FieldStatus>('idle')
  const [emailMsg,     setEmailMsg]     = useState('')
  const [pwStatus,     setPwStatus]     = useState<FieldStatus>('idle')
  const [pwMsg,        setPwMsg]        = useState('')
  const [pwcStatus,    setPwcStatus]    = useState<FieldStatus>('idle')
  const [pwcMsg,       setPwcMsg]       = useState('')
  const [brnStatus,    setBrnStatus]    = useState<FieldStatus>('idle')
  const [brnMsg,       setBrnMsg]       = useState('')

  const debouncedEmail = useDebounce(email, 600)
  const debouncedBrn   = useDebounce(brn, 500)

  // ── 이메일 중복 체크 (디바운스)
  useEffect(() => {
    if (!debouncedEmail || !debouncedEmail.includes('@')) {
      setEmailStatus('idle'); setEmailMsg(''); return
    }
    setEmailStatus('checking')
    fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: debouncedEmail }),
    })
      .then((r) => r.json())
      .then(({ exists }) => {
        if (exists) {
          setEmailStatus('error'); setEmailMsg('이미 가입된 이메일입니다.')
        } else {
          setEmailStatus('ok'); setEmailMsg('사용 가능한 이메일입니다.')
        }
      })
      .catch(() => { setEmailStatus('idle'); setEmailMsg('') })
  }, [debouncedEmail])

  // ── 비밀번호 실시간 검증
  useEffect(() => {
    if (!password) { setPwStatus('idle'); setPwMsg(''); return }
    if (password.length < 6) {
      setPwStatus('error'); setPwMsg('6자 이상 입력하세요.')
    } else {
      setPwStatus('ok'); setPwMsg('')
    }
  }, [password])

  // ── 비밀번호 확인 실시간 검증
  useEffect(() => {
    if (!passwordConfirm) { setPwcStatus('idle'); setPwcMsg(''); return }
    if (passwordConfirm !== password) {
      setPwcStatus('error'); setPwcMsg('비밀번호가 일치하지 않습니다.')
    } else {
      setPwcStatus('ok'); setPwcMsg('비밀번호가 일치합니다.')
    }
  }, [passwordConfirm, password])

  // ── 사업자번호 검증 (형식 → 중복)
  useEffect(() => {
    const digits = debouncedBrn.replace(/\D/g, '')
    if (!digits) { setBrnStatus('idle'); setBrnMsg(''); return }
    if (digits.length < 10) {
      setBrnStatus('error'); setBrnMsg('10자리를 모두 입력하세요.'); return
    }
    if (!validateBrn(debouncedBrn)) {
      setBrnStatus('error'); setBrnMsg('유효하지 않은 사업자등록번호입니다.'); return
    }
    // 형식 OK → 중복 체크
    setBrnStatus('checking')
    fetch('/api/check-brn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brn: debouncedBrn.replace(/\D/g, '') }),
    })
      .then((r) => r.json())
      .then(({ exists }) => {
        if (exists) {
          setBrnStatus('error'); setBrnMsg('이미 등록된 사업자번호입니다.')
        } else {
          setBrnStatus('ok'); setBrnMsg('유효한 사업자등록번호입니다.')
        }
      })
      .catch(() => { setBrnStatus('idle'); setBrnMsg('') })
  }, [debouncedBrn])

  // ── Step 1 제출
  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (emailStatus === 'error')  { showToast(emailMsg); return }
    if (emailStatus !== 'ok')     { showToast('이메일을 확인 중입니다.'); return }
    if (pwStatus === 'error')     { showToast(pwMsg); return }
    if (pwcStatus !== 'ok')       { showToast('비밀번호 확인을 완료해 주세요.'); return }
    setStep(2)
  }

  // ── Step 2 제출
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!officeName.trim()) { showToast('사무소 이름을 입력해 주세요.'); return }
    // 사업자번호 입력했으면 유효해야 함
    const brnDigits = brn.replace(/\D/g, '')
    if (brnDigits && brnStatus !== 'ok') { showToast(brnMsg || '사업자번호를 확인해 주세요.'); return }

    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      showToast(signUpError.message)
      setLoading(false); return
    }
    if (!data.user) { showToast('이메일 인증이 필요합니다.', 'info'); setLoading(false); return }

    const { error: officeError } = await supabase.from('offices').insert({
      owner_id: data.user.id,
      office_name: officeName.trim(),
      brn: brnDigits || null,
    })
    if (officeError) { showToast(officeError.message); setLoading(false); return }
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* 로고 */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
          >
            <Building2 size={30} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white/20" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">회원가입</h1>
        <p className="text-sm text-blue-200 mt-1">공인중개사 전용 매물 관리 시스템</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-blue-400' : s < step ? 'w-4 bg-emerald-400' : 'w-4 bg-white/20'}`} />
        ))}
        <span className="text-xs text-blue-300 ml-1">{step} / 2</span>
      </div>

      {/* 카드 */}
      <div className="w-full rounded-3xl p-6 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-1">
          {step === 1 ? '계정 만들기' : '사무소 정보'}
        </h2>
        <p className="text-xs text-blue-200 mb-5">
          {step === 1 ? '이메일과 비밀번호를 입력하세요' : '중개사무소 정보를 입력하세요'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleStep1} className="flex flex-col gap-4">
            {/* 이메일 */}
            <Field label="이메일" icon={Mail} status={emailStatus} message={emailMsg}>
              <input
                type="email" placeholder="office@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className={inputBase}
                style={{ ...inputStyle, borderColor: borderOf(emailStatus) }}
                onFocus={(e) => { if (emailStatus === 'idle') e.currentTarget.style.borderColor = focusBorder }}
                onBlur={(e)  => { if (emailStatus === 'idle') e.currentTarget.style.borderColor = blurBorder }}
              />
            </Field>

            {/* 비밀번호 */}
            <Field label="비밀번호" hint="6자 이상" icon={Lock} status={pwStatus} message={pwMsg}>
              <input
                type="password" placeholder="6자 이상" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className={inputBase}
                style={{ ...inputStyle, borderColor: borderOf(pwStatus) }}
              />
            </Field>

            {/* 비밀번호 확인 */}
            <Field label="비밀번호 확인" icon={Lock} status={pwcStatus} message={pwcMsg}>
              <input
                type="password" placeholder="비밀번호를 다시 입력하세요" value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)} required
                className={inputBase}
                style={{ ...inputStyle, borderColor: borderOf(pwcStatus) }}
              />
            </Field>

            <button
              type="submit"
              className="mt-1 w-full h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
            >
              다음 <ChevronRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* 사무소 이름 */}
            <Field label="중개사무소 이름" icon={Store}>
              <input
                placeholder="예) 행복부동산" value={officeName}
                onChange={(e) => setOfficeName(e.target.value)} required
                className={inputBase}
                style={{ ...inputStyle }}
                onFocus={(e) => e.currentTarget.style.borderColor = focusBorder}
                onBlur={(e)  => e.currentTarget.style.borderColor = blurBorder}
              />
            </Field>

            {/* 사업자등록번호 */}
            <Field
              label="사업자등록번호"
              hint="선택 · 000-00-00000"
              icon={Hash}
              status={brnStatus}
              message={brnMsg}
            >
              <input
                placeholder="000-00-00000" value={brn}
                onChange={(e) => setBrn(formatBrn(e.target.value))}
                inputMode="numeric"
                className={inputBase}
                style={{ ...inputStyle, borderColor: borderOf(brnStatus) }}
              />
            </Field>

            {/* 사업자번호 안내 */}
            {brnStatus === 'idle' && (
              <p className="text-[11px] text-blue-300/60 -mt-2">
                입력 시 국세청 알고리즘으로 즉시 유효성 검증 + 중복 체크됩니다
              </p>
            )}

            <div className="flex gap-3 mt-1">
              <button
                type="button" onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-xl text-sm font-medium text-blue-200 flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft size={16} /> 이전
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-[2] h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' }}
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '가입 완료'
                }
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-blue-200 mt-5">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-white font-semibold underline underline-offset-2">
          로그인
        </Link>
      </p>
    </div>
  )
}
