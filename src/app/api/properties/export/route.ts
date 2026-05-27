// 매물 목록 엑셀(CSV) 내보내기 API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDealPrice } from '@/lib/utils'

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // 쉼표, 줄바꿈, 따옴표가 있으면 따옴표로 감싸기
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const admin = createAdminClient()

  // 사무소 확인
  const { data: office } = await admin
    .from('offices')
    .select('id')
    .eq('owner_id', session.user.id)
    .single()

  if (!office) return NextResponse.json({ error: '사무소 없음' }, { status: 404 })

  // 쿼리 파라미터로 필터 적용
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const transaction_type = searchParams.get('transaction_type')
  const type = searchParams.get('type')

  let query = admin
    .from('properties')
    .select('*')
    .eq('office_id', office.id)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (transaction_type) query = query.eq('transaction_type', transaction_type)
  if (type) query = query.eq('type', type)

  const { data: properties } = await query

  if (!properties) return NextResponse.json({ error: '조회 실패' }, { status: 500 })

  // CSV 헤더
  const headers = [
    '별칭', '매물유형', '거래유형', '상태',
    '보증금/금액(만원)', '월세(만원)', '관리비(만원)',
    '주소', '상세주소',
    '전용면적(㎡)', '층', '전체층', '방수', '욕실수',
    '엘리베이터', '주차', '방향', '입주가능일',
    '태그', '비고', '등록일',
  ]

  const rows = properties.map((p) => [
    p.title,
    p.type,
    p.transaction_type,
    p.status === 'AVAILABLE' ? '진행중' : '완료',
    p.deposit,
    p.monthly_rent || '',
    p.maintenance_fee || '',
    p.address,
    p.detail_address || '',
    p.exclusive_area || '',
    p.floor || '',
    p.total_floors || '',
    p.room_count,
    p.bathroom_count,
    p.has_elevator === true ? '있음' : p.has_elevator === false ? '없음' : '',
    p.has_parking === true ? '가능' : p.has_parking === false ? '불가' : '',
    p.direction || '',
    p.move_in_type === '날짜지정' && p.move_in_date
      ? p.move_in_date.replace(/-/g, '.')
      : (p.move_in_type || ''),
    (p.tags as string[] ?? []).join(', '),
    p.memo || '',
    new Date(p.created_at).toLocaleDateString('ko-KR'),
  ])

  // BOM + CSV 생성 (한글 깨짐 방지)
  const BOM = '﻿'
  const csv = BOM + [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\n')

  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''%EB%A7%A4%EB%AC%BC%EB%AA%A9%EB%A1%9D_${today}.csv`,
    },
  })
}
