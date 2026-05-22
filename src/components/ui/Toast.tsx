'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const icons = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error: <XCircle size={18} className="text-red-500 shrink-0" />,
  info: <AlertCircle size={18} className="text-blue-500 shrink-0" />,
}

const styles = {
  success: 'bg-white border-green-200',
  error: 'bg-white border-red-200',
  info: 'bg-white border-blue-200',
}

export function Toast({ message, type = 'error', duration = 3500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-lg min-w-[260px] max-w-[340px] ${styles[type]}`}>
        {icons[type]}
        <p className="text-sm text-slate-800 flex-1">{message}</p>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="text-slate-400 ml-1">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  function showToast(message: string, type: ToastType = 'error') {
    setToast({ message, type })
  }

  function closeToast() {
    setToast(null)
  }

  return { toast, showToast, closeToast }
}
