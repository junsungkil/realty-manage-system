// 매물 목록에서 사용하는 카드 컴포넌트
'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Maximize2 } from 'lucide-react'
import { Property } from '@/types'
import { Badge } from '@/components/ui/Badge'
import {
  formatDealPrice,
  formatArea,
  formatFloor,
  formatStatus,
  getStatusColor,
} from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

function PropertyCardInner({ property }: PropertyCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const thumbnail = property.property_images?.find((img) => img.is_thumbnail)
    ?? property.property_images?.[0]

  function handleTagClick(e: React.MouseEvent, tag: string) {
    e.preventDefault()
    e.stopPropagation()
    const params = new URLSearchParams(searchParams.toString())
    params.set('tag', tag)
    params.delete('q') // 태그 필터 시 텍스트 검색 초기화
    router.push(`/properties?${params.toString()}`)
  }

  const dealTypeColor =
    property.transaction_type === '매매'
      ? 'bg-blue-100 text-blue-800'
      : property.transaction_type === '전세'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-orange-100 text-orange-800'

  return (
    <Link href={`/properties/${property.id}`}>
      <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform">
        <div className="flex gap-3 p-3">
          {/* 썸네일 */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            {thumbnail ? (
              <Image
                src={thumbnail.image_url}
                alt={property.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Maximize2 size={24} />
              </div>
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <Badge className={dealTypeColor}>{property.transaction_type}</Badge>
                <Badge className="bg-slate-100 text-slate-600">{property.type}</Badge>
                <Badge className={getStatusColor(property.status)}>
                  {formatStatus(property.status)}
                </Badge>
                {property.has_elevator === true && (
                  <Badge className="bg-green-100 text-green-700">엘베</Badge>
                )}
                {property.has_parking === true && (
                  <Badge className="bg-sky-100 text-sky-700">주차</Badge>
                )}
                {property.direction && (
                  <Badge className="bg-amber-100 text-amber-700">{property.direction}</Badge>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
                {property.title}
              </h3>
              <p className="text-xl font-bold text-blue-600 mt-0.5">
                {formatDealPrice(property.transaction_type, property.deposit, property.monthly_rent)}
                <span className="text-xs text-slate-500 font-normal ml-1">만원</span>
              </p>
            </div>

            <div className="flex flex-col gap-0.5">
              {property.maintenance_fee > 0 && (
                <p className="text-xs text-slate-500">
                  관리비 {property.maintenance_fee.toLocaleString()}만
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={11} />
                <span className="truncate">{property.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{formatArea(property.exclusive_area)}</span>
                {property.floor && (
                  <span>{formatFloor(property.floor, property.total_floors)}</span>
                )}
                <span>방 {property.room_count}</span>
                {property.move_in_type && (
                  <span className="text-slate-400">
                    {property.move_in_type === '날짜지정' && property.move_in_date
                      ? property.move_in_date.replace(/-/g, '.')
                      : property.move_in_type}
                  </span>
                )}
              </div>
              {/* 태그 — 클릭 시 해당 태그로 필터링 */}
              {property.tags && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {property.tags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => handleTagClick(e, tag)}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full active:bg-blue-100 active:text-blue-600 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                  {property.tags.length > 4 && (
                    <span className="text-[10px] text-slate-400">+{property.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// useSearchParams 사용으로 인한 Suspense 래퍼
export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Suspense fallback={
      <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
    }>
      <PropertyCardInner property={property} />
    </Suspense>
  )
}
