import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'error', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 150) // fade out 후 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!message) return null

  const typeStyles = {
    error: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-black'
  }

  return (
    <div 
      className={`
        fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 
        px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg z-50 transition-opacity duration-150
        text-sm sm:text-base max-w-xs sm:max-w-sm mx-4
        ${typeStyles[type]}
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {message}
    </div>
  )
}

