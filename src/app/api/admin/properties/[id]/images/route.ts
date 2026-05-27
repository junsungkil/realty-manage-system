// 관리자 - 매물 이미지 관리 API
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

// 이미지 삭제 (ids 배열)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  const { ids } = await req.json() as { ids: string[] }
  const admin = createAdminClient()
  const { error } = await admin.from('property_images').delete().in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// 이미지 추가 (urls 배열)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  const { id } = await params
  const { images } = await req.json() as { images: { image_url: string; is_thumbnail: boolean }[] }
  const admin = createAdminClient()
  const { error } = await admin.from('property_images').insert(
    images.map((img) => ({ ...img, property_id: id }))
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// 썸네일 지정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  const { imageId } = await req.json() as { imageId: string }
  const admin = createAdminClient()
  const { error } = await admin.from('property_images').update({ is_thumbnail: true }).eq('id', imageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
