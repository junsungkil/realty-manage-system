'use client'

import { useEffect } from 'react'

export function ViewTracker({ token }: { token: string }) {
  useEffect(() => {
    fetch(`/api/share/${token}/view`, { method: 'POST' }).catch(() => {})
  }, [token])

  return null
}
