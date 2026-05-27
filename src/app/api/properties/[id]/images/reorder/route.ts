// 이미지 순서 변경 API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { orderedIds } = await req.json() as { orderedIds: string[] }
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })

  const admin = createAdminClient()

  // 소유자 또는 관리자 확인
  const { data: property } = await admin
    .from('properties')
    .select('id, offices!inner(owner_id)')
    .eq('id', id)
    .single()

  if (!property) return NextResponse.json({ error: '매물 없음' }, { status: 404 })

  const isOwner = (property.offices as any).owner_id === session.user.id
  if (!isOwner) {
    const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', session.user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  // 순서 일괄 업데이트
  const updates = orderedIds.map((imageId, index) =>
    admin
      .from('property_images')
      .update({ sort_order: index, is_thumbnail: index === 0 })
      .eq('id', imageId)
      .eq('property_id', id)
  )
  await Promise.all(updates)

  return NextResponse.json({ ok: true })
}
