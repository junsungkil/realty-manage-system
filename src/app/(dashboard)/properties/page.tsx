// 매물 목록 페이지
import { createAdminClient } from '@/lib/supabase/admin'
import { PropertyCard } from '@/components/property/PropertyCard'
import { FilterBar } from '@/components/property/FilterBar'
import { Property } from '@/types'
import { Search, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface SearchParams {
  transaction?: string
  type?: string
  status?: string
  q?: string
}

async function PropertyList({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient()

  // 세션은 쿠키에서 직접 읽기 (SSL 우회)
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

  if (searchParams.transaction) {
    query = query.eq('transaction_type', searchParams.transaction)
  }
  if (searchParams.type) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.q) {
    query = query.ilike('address', `%${searchParams.q}%`)
  }

  const { data: properties } = await query

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <PlusCircle size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">등록된 매물이 없습니다.</p>
        <Link href="/properties/create" className="mt-4 text-sm text-blue-600 font-medium">
          첫 매물 등록하기
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
          <Link href="/properties/create" className="text-blue-600">
            <PlusCircle size={24} />
          </Link>
        </div>
        {/* 검색 */}
        <form method="GET" className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="주소로 검색"
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* 필터 */}
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
