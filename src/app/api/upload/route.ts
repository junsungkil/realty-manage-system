// Cloudflare R2 Presigned URL 발급 API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePresignedUrl, createImageKey } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { filename, contentType, propertyId } = await request.json()

  if (!filename || !contentType || !propertyId) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
  }

  // 이미지 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: office } = await admin
    .from('offices')
    .select('id')
    .eq('owner_id', session.user.id)
    .single()

  if (!office) {
    return NextResponse.json({ error: '사무소 정보를 찾을 수 없습니다.' }, { status: 404 })
  }

  const key = createImageKey(office.id, propertyId, filename)
  const presignedUrl = await generatePresignedUrl(key, contentType)
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ presignedUrl, publicUrl, key })
}
