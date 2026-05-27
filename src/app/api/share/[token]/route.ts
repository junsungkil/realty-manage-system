// 공유 토큰으로 매물 정보 조회 API (로그인 불필요)
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = createAdminClient()

  // 공유 레코드 조회
  const { data: share } = await admin
    .from('property_shares')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!share) {
    return NextResponse.json({ error: '링크를 찾을 수 없습니다.' }, { status: 404 })
  }

  // 만료 확인
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return NextResponse.json({ error: '만료된 링크입니다.' }, { status: 410 })
  }

  // 매물 + 이미지 조회
  const { data: property } = await admin
    .from('properties')
    .select(`
      *,
      property_images(*),
      offices(office_name, brn)
    `)
    .eq('id', share.property_id)
    .single()

  if (!property) {
    return NextResponse.json({ error: '매물을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json({
    fields: share.fields,
    expires_at: share.expires_at,
    property,
  })
}

// 공유 링크 삭제 (로그인 필요)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = createAdminClient()

  const { error } = await admin
    .from('property_shares')
    .delete()
    .eq('token', token)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
