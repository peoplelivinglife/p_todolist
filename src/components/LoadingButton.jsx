import LoadingSpinner from './LoadingSpinner'

export default function LoadingButton({ 
  children, 
  isLoading = false, 
  disabled = false,
  className = '',
  variant = 'primary',
  ...props 
}) {
  const baseClass = 'px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base touch-target'
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500'
  }

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}