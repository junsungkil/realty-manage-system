'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ChevronLeft, Trash2, Camera, X } from 'lucide-react'
import { PropertyType, TransactionType, Direction, MoveInType } from '@/types'

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: '아파트', label: '아파트' },
  { value: '빌라', label: '빌라' },
  { value: '원룸', label: '원룸' },
  { value: '오피스텔', label: '오피스텔' },
  { value: '상가', label: '상가' },
]

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: '월세', label: '월세' },
  { value: '전세', label: '전세' },
  { value: '매매', label: '매매' },
]

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
]

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: '남향', label: '남향' },
  { value: '남동향', label: '남동향' },
  { value: '동향', label: '동향' },
  { value: '남서향', label: '남서향' },
  { value: '서향', label: '서향' },
  { value: '북향', label: '북향' },
  { value: '북동향', label: '북동향' },
  { value: '북서향', label: '북서향' },
]

const MOVE_IN_TYPES: { value: MoveInType; label: string }[] = [
  { value: '즉시입주', label: '즉시입주' },
  { value: '날짜협의', label: '날짜협의' },
  { value: '날짜지정', label: '날짜지정' },
]

// 2-상태 토글: true / false
function BoolToggle({
  label,
  value,
  trueLabel = '있음',
  falseLabel = '없음',
  onChange,
}: {
  label: string
  value: boolean
  trueLabel?: string
  falseLabel?: string
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
            value === true
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-slate-300 text-slate-500'
          }`}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${
            value === false
              ? 'bg-slate-600 border-slate-600 text-white'
              : 'bg-white border-slate-300 text-slate-500'
          }`}
        >
          {falseLabel}
        </button>
      </div>
    </div>
  )
}

interface ExistingImage {
  id: string
  image_url: string
  is_thumbnail: boolean
}

interface NewImage {
  file: File
  preview: string
}

interface Props {
  property: {
    id: string
    title: string
    type: string
    transaction_type: string
    deposit: number
    monthly_rent: number
    maintenance_fee: number
    address: string
    detail_address: string | null
    exclusive_area: number | null
    room_count: number
    bathroom_count: number
    floor: number | null
    total_floors: number | null
    status: string
    memo: string | null
    has_elevator: boolean | null
    has_parking: boolean | null
    direction: string | null
    move_in_type: string | null
    move_in_date: string | null
  }
  images: ExistingImage[]
}

export function EditPropertyForm({ property, images: initialImages }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialImages)
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])

  const [form, setForm] = useState({
    title: property.title,
    type: property.type as PropertyType,
    transaction_type: property.transaction_type as TransactionType,
    deposit: property.deposit,
    monthly_rent: property.monthly_rent,
    maintenance_fee: property.maintenance_fee,
    address: property.address,
    detail_address: property.detail_address ?? '',
    exclusive_area: property.exclusive_area?.toString() ?? '',
    room_count: property.room_count,
    bathroom_count: property.bathroom_count,
    floor: property.floor?.toString() ?? '',
    total_floors: property.total_floors?.toString() ?? '',
    status: property.status,
    memo: property.memo ?? '',
    has_elevator: property.has_elevator ?? true,
    has_parking: property.has_parking ?? true,
    direction: (property.direction ?? '') as Direction | '',
    move_in_type: (property.move_in_type ?? '') as MoveInType | '',
    move_in_date: property.move_in_date ?? '',
  })

  function update(field: string, value: string | number | boolean | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isMonthly = form.transaction_type === '월세'

  function removeExistingImage(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
    setDeletedImageIds((prev) => [...prev, id])
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const added = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setNewImages((prev) => [...prev, ...added])
    e.target.value = ''
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadNewImages(): Promise<string[]> {
    const urls: string[] = []
    for (const img of newImages) {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: img.file.name, contentType: img.file.type, propertyId: property.id }),
        })
        if (!res.ok) continue
        const { presignedUrl, publicUrl } = await res.json()
        const uploadRes = await fetch(presignedUrl, { method: 'PUT', body: img.file, headers: { 'Content-Type': img.file.type } })
        if (uploadRes.ok) urls.push(publicUrl)
      } catch {
        console.warn('이미지 업로드 실패, 건너뜀')
      }
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: form.title,
        type: form.type,
        transaction_type: form.transaction_type,
        deposit: form.deposit,
        monthly_rent: form.monthly_rent,
        maintenance_fee: form.maintenance_fee,
        address: form.address,
        detail_address: form.detail_address || null,
        exclusive_area: form.exclusive_area ? parseFloat(form.exclusive_area) : null,
        room_count: Number(form.room_count) || 1,
        bathroom_count: Number(form.bathroom_count) || 1,
        floor: form.floor ? parseInt(form.floor) : null,
        total_floors: form.total_floors ? parseInt(form.total_floors) : null,
        status: form.status,
        memo: form.memo || null,
        has_elevator: form.has_elevator,
        has_parking: form.has_parking,
        direction: form.direction || null,
        move_in_type: form.move_in_type || null,
        move_in_date: form.move_in_type === '날짜지정' && form.move_in_date ? form.move_in_date : null,
      })
      .eq('id', property.id)

    if (updateError) {
      setError('수정에 실패했습니다.')
      setSubmitting(false)
      return
    }

    if (deletedImageIds.length > 0) {
      await supabase.from('property_images').delete().in('id', deletedImageIds)
    }

    if (newImages.length > 0) {
      const uploadedUrls = await uploadNewImages()
      if (uploadedUrls.length > 0) {
        const isFirstImage = existingImages.length === 0 && deletedImageIds.length >= initialImages.length
        await supabase.from('property_images').insert(
          uploadedUrls.map((url, i) => ({
            property_id: property.id,
            image_url: url,
            is_thumbnail: isFirstImage && i === 0,
          }))
        )
      }
    }

    const remainingImages = existingImages.filter((img) => !deletedImageIds.includes(img.id))
    const hasThumbnail = remainingImages.some((img) => img.is_thumbnail)
    if (!hasThumbnail && remainingImages.length > 0) {
      await supabase.from('property_images').update({ is_thumbnail: true }).eq('id', remainingImages[0].id)
    }

    window.location.href = `/properties/${property.id}`
  }

  async function handleDelete() {
    if (!confirm('이 매물을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return
    setDeleting(true)
    await supabase.from('properties').delete().eq('id', property.id)
    window.location.href = '/properties'
  }

  const totalImageCount = existingImages.length + newImages.length

  return (
    <div className="flex flex-col min-h-full">
      {/* 헤더 */}
      <div className="bg-white px-4 pt-12 pb-3 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft size={24} className="text-slate-700" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-slate-900">매물 수정</h1>
        <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-500 disabled:opacity-40">
          <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 pb-8">

        {/* 사진 관리 */}
        <section>
          <p className="text-sm font-medium text-slate-700 mb-2">사진</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {totalImageCount < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 active:bg-slate-50"
              >
                <Camera size={20} />
                <span className="text-xs mt-1">{totalImageCount}/10</span>
              </button>
            )}
            {existingImages.map((img, i) => (
              <div key={img.id} className="relative shrink-0 w-20 h-20">
                <Image src={img.image_url} alt={`사진 ${i + 1}`} fill className="object-cover rounded-xl" sizes="80px" />
                {img.is_thumbnail && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center rounded-b-xl py-0.5">대표</span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={i} className="relative shrink-0 w-20 h-20">
                <Image src={img.preview} alt={`새 사진 ${i + 1}`} fill className="object-cover rounded-xl" sizes="80px" />
                {existingImages.length === 0 && i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center rounded-b-xl py-0.5">대표</span>
                )}
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
        </section>

        {/* 기본 정보 */}
        <section className="flex flex-col gap-4">
          <Input
            id="title"
            label="매물 별칭 *"
            placeholder="예) 역삼역 코너 원룸"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select id="type" label="매물 유형" options={PROPERTY_TYPES} value={form.type} onChange={(e) => update('type', e.target.value)} />
            <Select id="transaction_type" label="거래 유형" options={TRANSACTION_TYPES} value={form.transaction_type} onChange={(e) => update('transaction_type', e.target.value)} />
          </div>
          <Select id="status" label="매물 상태" options={STATUS_OPTIONS} value={form.status} onChange={(e) => update('status', e.target.value)} />
        </section>

        {/* 가격 정보 */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-slate-800 -mb-1">가격 정보</p>
          <Input
            id="deposit"
            label={form.transaction_type === '월세' ? '보증금 (만원)' : '금액 (만원)'}
            type="number"
            value={form.deposit || ''}
            onChange={(e) => update('deposit', parseInt(e.target.value) || 0)}
            suffix="만원"
          />
          {isMonthly && (
            <Input
              id="monthly_rent"
              label="월세 (만원)"
              type="number"
              value={form.monthly_rent || ''}
              onChange={(e) => update('monthly_rent', parseInt(e.target.value) || 0)}
              suffix="만원"
            />
          )}
          <Input
            id="maintenance_fee"
            label="관리비 (만원)"
            type="number"
            value={form.maintenance_fee || ''}
            onChange={(e) => update('maintenance_fee', parseInt(e.target.value) || 0)}
            suffix="만원"
          />
        </section>

        {/* 위치 및 구조 */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-slate-800 -mb-1">위치 및 구조</p>
          <Input id="address" label="주소 *" value={form.address} onChange={(e) => update('address', e.target.value)} required />
          <Input id="detail_address" label="동/호수 (내부용)" value={form.detail_address} onChange={(e) => update('detail_address', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="exclusive_area" label="전용면적 (㎡)" type="number" value={form.exclusive_area} onChange={(e) => update('exclusive_area', e.target.value)} suffix="㎡" />
            <div className="flex gap-2">
              <Input id="floor" label="층" type="number" value={form.floor} onChange={(e) => update('floor', e.target.value)} suffix="층" />
              <Input id="total_floors" label="전체" type="number" value={form.total_floors} onChange={(e) => update('total_floors', e.target.value)} suffix="층" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="room_count"
              label="방 개수"
              type="number"
              min="1"
              value={form.room_count}
              onChange={(e) => update('room_count', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
              suffix="개"
            />
            <Input
              id="bathroom_count"
              label="욕실 개수"
              type="number"
              min="1"
              value={form.bathroom_count}
              onChange={(e) => update('bathroom_count', e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
              suffix="개"
            />
          </div>
        </section>

        {/* 추가 정보 */}
        <section className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-slate-800 -mb-1">추가 정보</p>

          <BoolToggle
            label="엘리베이터"
            value={form.has_elevator as boolean}
            trueLabel="있음"
            falseLabel="없음"
            onChange={(v) => update('has_elevator', v)}
          />
          <BoolToggle
            label="주차"
            value={form.has_parking as boolean}
            trueLabel="가능"
            falseLabel="불가"
            onChange={(v) => update('has_parking', v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="direction" className="text-sm font-medium text-slate-700">방향</label>
              <select
                id="direction"
                value={form.direction}
                onChange={(e) => update('direction', e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white text-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">미선택</option>
                {DIRECTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="move_in_type" className="text-sm font-medium text-slate-700">입주 가능일</label>
              <select
                id="move_in_type"
                value={form.move_in_type}
                onChange={(e) => update('move_in_type', e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white text-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">미선택</option>
                {MOVE_IN_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.move_in_type === '날짜지정' && (
            <Input
              id="move_in_date"
              label="입주 날짜"
              type="date"
              value={form.move_in_date}
              onChange={(e) => update('move_in_date', e.target.value)}
            />
          )}
        </section>

        {/* 내부 메모 */}
        <section>
          <label htmlFor="memo" className="text-sm font-medium text-slate-700 block mb-1">비고 / 추가사항</label>
          <textarea
            id="memo"
            value={form.memo}
            onChange={(e) => update('memo', e.target.value)}
            rows={3}
            placeholder="특이사항, 추가 메모 등"
            className="w-full rounded-xl border border-slate-300 bg-white text-slate-900 px-3 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </section>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          수정 완료
        </Button>
      </form>
    </div>
  )
}
