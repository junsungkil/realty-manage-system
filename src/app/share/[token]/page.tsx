// 매물 공개 공유 페이지 — 로그인 불필요
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShareField } from '@/types'
import { ImageSlider } from '@/app/(dashboard)/properties/[id]/ImageSlider'
import { formatDealPrice, formatArea, formatFloor } from '@/lib/utils'
import {
  MapPin, Maximize2, Home, Bath, Layers,
  ArrowUpDown, CarFront, Compass, CalendarDays,
  Building2, Phone, Clock,
} from 'lucide-react'

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: share } = await admin
    .from('property_shares')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!share) notFound()

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <Clock size={40} className="text-slate-300 mb-4" />
        <h1 className="text-lg font-bold text-slate-700">만료된 링크입니다</h1>
        <p className="text-sm text-slate-500 mt-2">이 공유 링크의 유효기간이 지났습니다.</p>
      </div>
    )
  }

  const { data: property } = await admin
    .from('properties')
    .select('*, property_images(*), offices(office_name, brn)')
    .eq('id', share.property_id)
    .single()

  if (!property) notFound()

  const fields = share.fields as ShareField[]
  const has = (f: ShareField) => fields.includes(f)

  const images = property.property_images ?? []
  const office = property.offices as { office_name: string; brn: string | null } | null

  const dealTypeColor: Record<string, string> = {
    매매: 'bg-blue-100 text-blue-800',
    전세: 'bg-purple-100 text-purple-800',
    월세: 'bg-orange-100 text-orange-800',
  }

  const expiresText = share.expires_at
    ? `${new Date(share.expires_at).toLocaleDateString('ko-KR')} 까지`
    : null

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 상단 공유 배너 */}
      <div className="bg-blue-600 px-4 py-2 flex items-center justify-center gap-2">
        <Building2 size={14} className="text-blue-200" />
        <p className="text-xs text-blue-100 text-center">
          {office?.office_name ?? '중개사무소'}에서 공유한 매물입니다
          {expiresText && <span className="ml-2 opacity-70">· {expiresText}</span>}
        </p>
      </div>

      {/* 이미지 슬라이더 */}
      {has('images') && images.length > 0 ? (
        <ImageSlider images={images} title={property.title} />
      ) : (
        <div className="w-full aspect-[4/3] bg-slate-200 flex items-center justify-center text-slate-400">
          <Maximize2 size={40} />
        </div>
      )}

      <div className="p-4 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* 매물 유형 + 제목 */}
        <section>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dealTypeColor[property.transaction_type] ?? 'bg-slate-100 text-slate-700'}`}>
              {property.transaction_type}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {property.type}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{property.title}</h1>
        </section>

        {/* 가격 */}
        {has('price') && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">
              {property.transaction_type === '월세' ? '보증금 / 월세' : property.transaction_type === '전세' ? '전세금' : '매매가'}
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {formatDealPrice(property.transaction_type, property.deposit, property.monthly_rent)}
              <span className="text-base font-normal text-slate-500 ml-1">만원</span>
            </p>
            {property.maintenance_fee > 0 && (
              <p className="text-sm text-slate-500 mt-1">관리비 {property.maintenance_fee.toLocaleString()}만원</p>
            )}
          </section>
        )}

        {/* 주소 */}
        {(has('address') || has('detail_address')) && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
            <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              {has('address') && <p className="text-sm font-medium text-slate-800">{property.address}</p>}
              {has('detail_address') && property.detail_address && (
                <p className="text-xs text-slate-500 mt-0.5">{property.detail_address}</p>
              )}
            </div>
          </section>
        )}

        {/* 구조 정보 그리드 */}
        {(has('area') || has('floor') || has('rooms')) && (
          <section className="grid grid-cols-3 gap-3">
            {has('area') && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
                <Layers size={16} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">면적</p>
                <p className="text-sm font-semibold text-slate-800">{formatArea(property.exclusive_area)}</p>
              </div>
            )}
            {has('floor') && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
                <Home size={16} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">층수</p>
                <p className="text-sm font-semibold text-slate-800">{formatFloor(property.floor, property.total_floors)}</p>
              </div>
            )}
            {has('rooms') && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
                <Bath size={16} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">방/욕실</p>
                <p className="text-sm font-semibold text-slate-800">{property.room_count} / {property.bathroom_count}</p>
              </div>
            )}
          </section>
        )}

        {/* 추가 정보 */}
        {(has('elevator') || has('parking') || has('direction') || has('move_in')) && (
          <section className="grid grid-cols-2 gap-3">
            {has('elevator') && property.has_elevator !== null && (
              <div className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm border border-slate-100">
                <ArrowUpDown size={16} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">엘리베이터</p>
                  <p className="text-sm font-semibold text-slate-800">{property.has_elevator ? '있음' : '없음'}</p>
                </div>
              </div>
            )}
            {has('parking') && property.has_parking !== null && (
              <div className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm border border-slate-100">
                <CarFront size={16} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">주차</p>
                  <p className="text-sm font-semibold text-slate-800">{property.has_parking ? '가능' : '불가'}</p>
                </div>
              </div>
            )}
            {has('direction') && property.direction && (
              <div className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm border border-slate-100">
                <Compass size={16} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">방향</p>
                  <p className="text-sm font-semibold text-slate-800">{property.direction}</p>
                </div>
              </div>
            )}
            {has('move_in') && property.move_in_type && (
              <div className="bg-white rounded-xl p-3 flex items-center gap-2.5 shadow-sm border border-slate-100">
                <CalendarDays size={16} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">입주 가능일</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {property.move_in_type === '날짜지정' && property.move_in_date
                      ? property.move_in_date.replace(/-/g, '.')
                      : property.move_in_type}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 비고 */}
        {has('memo') && property.memo && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-800 mb-1">비고 / 추가사항</p>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{property.memo}</p>
          </section>
        )}

        {/* 사무소 정보 */}
        {has('office') && office && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{office.office_name}</p>
              {office.brn && <p className="text-xs text-slate-500 mt-0.5">사업자 {office.brn}</p>}
            </div>
          </section>
        )}

        {/* 하단 여백 */}
        <div className="h-6" />
      </div>
    </div>
  )
}
