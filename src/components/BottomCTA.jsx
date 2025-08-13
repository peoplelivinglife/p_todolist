import { Link, useLocation } from 'react-router-dom'
import { useDateContext } from '../hooks/useDateContext'

export default function BottomCTA() {
  const { selectedDateString } = useDateContext()
  const location = useLocation()
  
  // AddPage에서는 등록하기 버튼으로 작동
  if (location.pathname === '/add') {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t shadow-lg z-20">
        <div className="container-narrow">
          <button
            type="submit"
            form="add-form"
            className="block w-full bg-blue-500 text-white text-center py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-target text-sm sm:text-base font-medium"
          >
            <span className="text-white text-lg sm:text-xl">✓</span>
            <span className="text-white">등록하기</span>
          </button>
        </div>
      </div>
    )
  }
  
  // 다른 페이지에서는 추가하기 버튼으로 작동
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t shadow-lg z-20">
      <div className="container-narrow">
        <Link 
          to={`/add?date=${selectedDateString}`}
          className="block w-full bg-blue-500 text-white text-center py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center gap-2 touch-target text-sm sm:text-base font-medium"
        >
          <span className="text-white text-lg sm:text-xl">+</span>
          <span className="text-white">추가하기</span>
        </Link>
      </div>
    </div>
  )
}