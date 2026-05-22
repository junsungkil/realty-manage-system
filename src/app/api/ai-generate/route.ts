// Claude API를 이용한 매물 홍보문구 자동 생성 API
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { formatDealPrice, formatArea, formatFloor } from '@/lib/utils'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { propertyId } = await request.json()
  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId가 필요합니다.' }, { status: 400 })
  }

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (!property) {
    return NextResponse.json({ error: '매물을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 홍보문구 생성용 매물 정보 요약
  const priceText = formatDealPrice(property.transaction_type, property.deposit, property.monthly_rent)
  const areaText = formatArea(property.exclusive_area)
  const floorText = formatFloor(property.floor, property.total_floors)

  const prompt = `당신은 부동산 전문 마케팅 카피라이터입니다.
아래 매물 정보를 바탕으로 네이버 부동산, 직방, 다방에 올릴 수 있는 매력적인 홍보 문구를 작성해주세요.

[매물 정보]
- 매물명: ${property.title}
- 유형: ${property.type}
- 거래: ${property.transaction_type} ${priceText}만원
- 위치: ${property.address}
- 면적: ${areaText}
- 층수: ${floorText}
- 방/욕실: ${property.room_count}개 / ${property.bathroom_count}개
${property.maintenance_fee ? `- 관리비: ${property.maintenance_fee}만원` : ''}
${property.memo ? `- 특이사항 (비공개, 참고만): ${property.memo}` : ''}

[작성 조건]
1. 총 400~600자 내외
2. 첫 줄은 눈에 띄는 캐치프레이즈로 시작
3. 위치, 구조, 가격 메리트를 자연스럽게 녹여서 작성
4. 특이사항이 있으면 간접적으로 장점으로 표현 (비밀번호, 집주인 성향 등 민감 정보는 절대 언급 금지)
5. 마지막은 문의 유도 문구로 마무리
6. 이모지를 적절히 활용해 가독성 향상`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const description = (message.content[0] as { type: string; text: string }).text

  await supabase
    .from('properties')
    .update({ ai_description: description })
    .eq('id', propertyId)

  return NextResponse.json({ description })
}
