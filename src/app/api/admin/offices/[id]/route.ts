// 관리자 - 사무소 수정/삭제 API
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return data?.is_admin === true
}

// 사무소 수정 (office_name, brn)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const admin = createAdminClient()

  const { error } = await admin
    .from('offices')
    .update({ office_name: body.office_name, brn: body.brn ?? null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// 사무소 삭제 (관련 매물 cascade)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  // 해당 사무소의 매물 ID 목록
  const { data: properties } = await admin
    .from('properties')
    .select('id')
    .eq('office_id', id)

  const propertyIds = properties?.map((p) => p.id) ?? []

  if (propertyIds.length > 0) {
    // 공유 링크 삭제
    await admin.from('property_shares').delete().in('property_id', propertyIds)
    // 이미지 삭제
    await admin.from('property_images').delete().in('property_id', propertyIds)
    // 매물 삭제
    await admin.from('properties').delete().in('id', propertyIds)
  }

  // 사무소 삭제
  const { error } = await admin.from('offices').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
