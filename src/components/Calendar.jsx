import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns'
import { useState } from 'react'

export default function Calendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm" style={{ padding: '16px' }}>
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPrevMonth}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-lg sm:text-xl md:text-2xl">←</span>
        </button>
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
          {format(currentMonth, 'yyyy년 M월')}
        </h3>
        <button 
          onClick={goToNextMonth}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-lg sm:text-xl md:text-2xl">→</span>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center text-sm sm:text-base font-medium text-gray-600" style={{ padding: '8px 4px' }}>
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`
                text-center rounded-lg transition-colors text-sm sm:text-base md:text-lg font-medium
                ${!isCurrentMonth 
                  ? 'text-gray-300' 
                  : 'text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                }
                ${isSelected 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : ''
                }
              `}
              style={{ 
                padding: '12px 8px',
                minHeight: '44px'
              }}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}