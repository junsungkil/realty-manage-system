// 사업자등록번호 중복 체크 API
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { brn } = await request.json()

  if (!brn) return NextResponse.json({ exists: false })

  const admin = createAdminClient()
  const { data } = await admin
    .from('offices')
    .select('id')
    .eq('brn', brn)
    .maybeSingle()

  return NextResponse.json({ exists: !!data })
}
