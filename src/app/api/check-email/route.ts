import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ exists: false })
  }

  const admin = createAdminClient()
  const { data } = await admin.auth.admin.listUsers()

  const exists = data?.users?.some((u) => u.email === email) ?? false

  return NextResponse.json({ exists })
}
