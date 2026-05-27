// 관리자 - 매물 삭제 API
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

// 매물 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { id } = await params
  const admin = createAdminClient()

  // 공유 링크 삭제
  await admin.from('property_shares').delete().eq('property_id', id)
  // 이미지 삭제
  await admin.from('property_images').delete().eq('property_id', id)
  // 매물 삭제
  const { error } = await admin.from('properties').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
