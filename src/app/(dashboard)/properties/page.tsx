// 매물 목록 페이지
import { createAdminClient } from '@/lib/supabase/admin'
import { PropertyCard } from '@/components/property/PropertyCard'
import { FilterBar } from '@/components/property/FilterBar'
import { SearchBar } from '@/components/property/SearchBar'
import { ExportButton } from '@/components/property/ExportButton'
import { Property } from '@/types'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface SearchParams {
  transaction?: string
  type?: string
  status?: string
  q?: string
  // 고급 필터
  area_min?: string
  area_max?: string
  deposit_min?: string
  deposit_max?: string
  floor_min?: string
  floor_max?: string
  has_elevator?: string
  has_parking?: string
  direction?: string
  tag?: string
}

async function PropertyList({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient()

  const { createClient: createServerClient } = await import('@/lib/supabase/server')
  const serverSupabase = await createServerClient()
  const { data: { session } } = await serverSupabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-sm">로그인이 필요합니다.</p>
      </div>
    )
  }

  const { data: office } = await supabase
    .from('offices')
    .select('id')
    .eq('owner_id', userId)
    .single()

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <p className="text-sm">사무소 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  let query = supabase
    .from('properties')
    .select('*, property_images(*)')
    .eq('office_id', office.id)
    .order('created_at', { ascending: false })

  // 기본 필터
  if (searchParams.transaction) query = query.eq('transaction_type', searchParams.transaction)
  if (searchParams.type) query = query.eq('type', searchParams.type)
  if (searchParams.status) query = query.eq('status', searchParams.status)

  // 검색어: 주소 + 별칭 + 동호수 + 메모 + 태그
  if (searchParams.q) {
    const q = searchParams.q
    query = query.or(
      `address.ilike.%${q}%,title.ilike.%${q}%,detail_address.ilike.%${q}%,memo.ilike.%${q}%,tags.cs.{${q}}`
    )
  }

  // 고급 필터
  if (searchParams.area_min) query = query.gte('exclusive_area', Number(searchParams.area_min))
  if (searchParams.area_max) query = query.lte('exclusive_area', Number(searchParams.area_max))
  if (searchParams.deposit_min) query = query.gte('deposit', Number(searchParams.deposit_min))
  if (searchParams.deposit_max) query = query.lte('deposit', Number(searchParams.deposit_max))
  if (searchParams.floor_min) query = query.gte('floor', Number(searchParams.floor_min))
  if (searchParams.floor_max) query = query.lte('floor', Number(searchParams.floor_max))
  if (searchParams.has_elevator !== undefined && searchParams.has_elevator !== '') {
    query = query.eq('has_elevator', searchParams.has_elevator === 'true')
  }
  if (searchParams.has_parking !== undefined && searchParams.has_parking !== '') {
    query = query.eq('has_parking', searchParams.has_parking === 'true')
  }
  if (searchParams.direction) query = query.eq('direction', searchParams.direction)
  // 태그 필터 (상세필터에서 특정 태그 선택 시)
  if (searchParams.tag) query = query.contains('tags', [searchParams.tag])

  const { data: properties } = await query

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <PlusCircle size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">조건에 맞는 매물이 없습니다.</p>
        <Link href="/properties/create" className="mt-4 text-sm text-blue-600 font-medium">
          매물 등록하기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p as Property} />
      ))}
    </div>
  )
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-4 pt-12 pb-3 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-900">매물 목록</h1>
          <div className="flex items-center gap-2">
            <ExportButton />
            <Link href="/properties/create" className="text-blue-600">
              <PlusCircle size={24} />
            </Link>
          </div>
        </div>
        {/* 검색 + 상세필터 */}
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* 필터 탭 */}
      <Suspense>
        <FilterBar />
      </Suspense>

      {/* 목록 */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        }
      >
        <PropertyList searchParams={params} />
      </Suspense>
    </div>
  )
}
