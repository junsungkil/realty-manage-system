// 매물 복사 API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const admin = createAdminClient()

  // 원본 매물 조회 (소유자 확인 포함)
  const { data: original } = await admin
    .from('properties')
    .select('*, offices!inner(owner_id)')
    .eq('id', id)
    .single()

  if (!original) return NextResponse.json({ error: '매물 없음' }, { status: 404 })
  if ((original.offices as any).owner_id !== session.user.id) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  // 복사할 필드 목록 (id, created_at, updated_at, offices 제외)
  const {
    id: _id,
    created_at: _ca,
    updated_at: _ua,
    offices: _offices,
    ...fields
  } = original

  const { data: copied, error } = await admin
    .from('properties')
    .insert({ ...fields, title: `${fields.title} (복사본)`, status: 'AVAILABLE' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: copied.id })
}
