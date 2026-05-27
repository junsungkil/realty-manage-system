// 매물 수정 페이지
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { EditPropertyForm } from './EditPropertyForm'
import { Suspense } from 'react'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: property } = await admin
    .from('properties')
    .select('*, property_images(*)')
    .eq('id', id)
    .single()

  if (!property) notFound()

  return (
    <Suspense>
      <EditPropertyForm property={property} images={property.property_images ?? []} />
    </Suspense>
  )
}
