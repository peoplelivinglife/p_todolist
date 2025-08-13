import { useState } from 'react'

// Toast 관리를 위한 커스텀 훅
export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type, duration })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}