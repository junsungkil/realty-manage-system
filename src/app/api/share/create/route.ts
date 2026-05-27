// 공유 링크 생성 API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShareField } from '@/types'

function generateToken(length = 10): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789' // 혼동 문자 제외
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { property_id, fields, expires_days } = await request.json() as {
    property_id: string
    fields: ShareField[]
    expires_days: number | null  // null = 무제한
  }

  if (!property_id || !fields?.length) {
    return NextResponse.json({ error: '필수 값 누락' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 해당 매물이 본인 사무소 소속인지 확인
  const { data: property } = await admin
    .from('properties')
    .select('id, offices!inner(owner_id)')
    .eq('id', property_id)
    .single()

  if (!property || (property.offices as any).owner_id !== session.user.id) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  // 기존 공유 링크가 있으면 삭제 (매물당 1개)
  await admin.from('property_shares').delete().eq('property_id', property_id)

  // 토큰 생성 (충돌 시 재시도)
  let token = generateToken()
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin
      .from('property_shares').select('id').eq('token', token).maybeSingle()
    if (!existing) break
    token = generateToken()
  }

  const expires_at = expires_days
    ? new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { data, error } = await admin
    .from('property_shares')
    .insert({ property_id, token, fields, expires_at })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: data.token })
}
