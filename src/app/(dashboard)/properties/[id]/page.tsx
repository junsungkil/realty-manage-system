// 매물 상세 페이지
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Property } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { AiGenerateButton } from './AiGenerateButton'
import { StatusUpdateButton } from './StatusUpdateButton'
import {
  formatDealPrice,
  formatArea,
  formatFloor,
  formatStatus,
  getStatusColor,
} from '@/lib/utils'
import { ChevronLeft, MapPin, Home, Bath, Layers, Pencil } from 'lucide-react'
import Link from 'next/link'

const dealTypeColor: Record<string, string> = {
  매매: 'bg-blue-100 text-blue-800',
  전세: 'bg-purple-100 text-purple-800',
  월세: 'bg-orange-100 text-orange-800',
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('id', id)
    .single()

  if (!property) notFound()

  const p = property as Property
  const images = p.property_images ?? []
  const thumbnail = images.find((i) => i.is_thumbnail) ?? images[0]

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 sticky top-0 z-10 bg-white border-b border-slate-100">
        <Link href="/properties" className="p-1 -ml-1">
          <ChevronLeft size={24} className="text-slate-700" />
        </Link>
        <h1 className="flex-1 text-lg font-bold text-slate-900 truncate">{p.title}</h1>
        <Link href={`/properties/${p.id}/edit`} className="p-2 text-slate-500">
          <Pencil size={18} />
        </Link>
        <StatusUpdateButton propertyId={p.id} currentStatus={p.status} />
      </div>

      {/* 이미지 */}
      {images.length > 0 ? (
        <div className="relative w-full aspect-[4/3] bg-black">
          <Image
            src={thumbnail?.image_url ?? images[0].image_url}
            alt={p.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              1 / {images.length}
            </span>
          )}
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300">
          <Home size={48} />
        </div>
      )}

      <div className="p-4 flex flex-col gap-5">
        {/* 거래 유형 + 가격 */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={dealTypeColor[p.transaction_type]}>{p.transaction_type}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{p.type}</Badge>
            <Badge className={getStatusColor(p.status)}>{formatStatus(p.status)}</Badge>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {formatDealPrice(p.transaction_type, p.deposit, p.monthly_rent)}
            <span className="text-base font-normal text-slate-500 ml-1">만원</span>
          </p>
          {p.maintenance_fee > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              관리비 {p.maintenance_fee.toLocaleString()}만원
            </p>
          )}
        </section>

        {/* 위치 */}
        <section className="flex flex-col gap-1">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-sm font-medium">{p.address}</p>
              {p.detail_address && (
                <p className="text-xs text-slate-500 mt-0.5">{p.detail_address}</p>
              )}
            </div>
          </div>
        </section>

        {/* 구조 정보 */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Layers size={16} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">면적</p>
            <p className="text-sm font-semibold text-slate-800">{formatArea(p.exclusive_area)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Home size={16} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">층수</p>
            <p className="text-sm font-semibold text-slate-800">{formatFloor(p.floor, p.total_floors)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Bath size={16} className="mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">방/욕실</p>
            <p className="text-sm font-semibold text-slate-800">{p.room_count}개 / {p.bathroom_count}개</p>
          </div>
        </section>

        {/* 내부 메모 */}
        {p.memo && (
          <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-yellow-800 mb-1">내부 메모 (비공개)</p>
            <p className="text-sm text-yellow-900 whitespace-pre-wrap">{p.memo}</p>
          </section>
        )}

        {/* AI 홍보문구 */}
        <section>
          <AiGenerateButton propertyId={p.id} initialDescription={p.ai_description} />
        </section>

        {/* 이미지 전체 보기 (다중 이미지) */}
        {images.length > 1 && (
          <section>
            <p className="text-sm font-semibold text-slate-800 mb-2">사진 전체 ({images.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src={img.image_url}
                    alt={`사진 ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
