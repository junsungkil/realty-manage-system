// 매물 상태 변경 버튼 클라이언트 컴포넌트
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PropertyStatus } from '@/types'
import { formatStatus, getStatusColor } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusOptions: PropertyStatus[] = ['AVAILABLE', 'COMPLETED']

interface Props {
  propertyId: string
  currentStatus: PropertyStatus
}

export function StatusUpdateButton({ propertyId, currentStatus }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<PropertyStatus>(currentStatus)

  async function handleStatusChange(newStatus: PropertyStatus) {
    setOpen(false)
    if (newStatus === status) return

    await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', propertyId)

    setStatus(newStatus)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          getStatusColor(status)
        )}
      >
        {formatStatus(status)}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-30 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-28">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={cn(
                  'w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50',
                  s === status && 'font-semibold text-blue-600'
                )}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
