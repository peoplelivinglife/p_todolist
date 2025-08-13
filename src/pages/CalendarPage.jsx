import { useState, useEffect } from 'react'
import { addDays, subDays, format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { useDateContext } from '../hooks/useDateContext'
import { getDocs, updateDoc, doc, collection, query, where, orderBy, db } from '../lib/firebase'
import { formatISODate } from '../utils/dateUtils'
import { useToast } from '../hooks/useToast'
import LoadingSpinner from '../components/LoadingSpinner'
import Toast from '../components/Toast'

const TAG_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500', 
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
}

export default function CalendarPage(){
  const { selectedDate, setSelectedDate } = useDateContext()
  const [showCalendar, setShowCalendar] = useState(false)
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const navigate = useNavigate()

  // 선택된 날짜의 할 일 불러오기
  useEffect(() => {
    loadTodosForDate(selectedDate)
  }, [selectedDate])

  // 페이지에 포커스가 돌아올 때 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      loadTodosForDate(selectedDate)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [selectedDate])

  const loadTodosForDate = async (date) => {
    setLoading(true)
    try {
      const dateString = formatISODate(date)
      const q = await query(
        await collection(db, 'todos'),
        await where('date', '==', dateString),
        await orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTodos(items)
    } catch (error) {
      console.error('Error loading todos:', error)
      // 에러가 있어도 빈 배열로 설정
      setTodos([])
    } finally {
      setLoading(false)
    }
  }

  // 완료 상태 토글
  const toggleCompleted = async (todoId, currentCompleted) => {
    try {
      const todoRef = await doc(db, 'todos', todoId)
      await updateDoc(todoRef, {
        completed: !currentCompleted,
        updatedAt: new Date()
      })
      
      // 로컬 상태 업데이트
      setTodos(prev => prev.map(todo => 
        todo.id === todoId 
          ? { ...todo, completed: !currentCompleted }
          : todo
      ))
    } catch (error) {
      console.error('Error toggling completion:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
    }
  }

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const goToPrevDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1))
  }

  const goToNextDay = () => {
    setSelectedDate(nextDate => addDays(nextDate, 1))
  }

  const goToBacklog = () => {
    navigate('/backlog')
  }

  return (
    <section style={{ marginBottom: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          {/* 좌: 캘린더 아이콘 */}
          <button 
            onClick={toggleCalendar}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-xl sm:text-2xl md:text-3xl">📅</span>
          </button>
          
          {/* 중앙: 날짜 + 화살표 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={goToPrevDay}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-lg sm:text-xl md:text-2xl">◀</span>
            </button>
            <div className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-base sm:text-lg md:text-xl text-center bg-gray-50 rounded-lg min-w-[140px] sm:min-w-[160px]">
              {format(selectedDate, 'yyyy.MM.dd')}
            </div>
            <button 
              onClick={goToNextDay}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-lg sm:text-xl md:text-2xl">▶</span>
            </button>
          </div>
          
          {/* 우: 백로그 아이콘 */}
          <button 
            onClick={goToBacklog}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-xl sm:text-2xl md:text-3xl">📋</span>
          </button>
        </div>

        {/* 본문 */}
        <div style={{ minHeight: '400px' }} className="sm:min-h-[500px] md:min-h-[600px]">
          {showCalendar ? (
            <div className="w-full max-w-md mx-auto sm:max-w-lg">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          ) : (
            <div>
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                  {format(selectedDate, 'yyyy년 M월 d일')}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  로딩 중...
                </div>
              ) : todos.length === 0 ? (
                <div className="card text-center text-gray-500">
                  <p className="text-base sm:text-lg md:text-xl">이 날짜에 할 일이 없습니다</p>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base">아래 버튼을 눌러 할 일을 추가해보세요</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {todos.map(todo => (
                    <div key={todo.id} className="card hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* 완료 체크박스 */}
                        <button
                          onClick={() => toggleCompleted(todo.id, todo.completed)}
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-colors
                            ${todo.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-400 active:border-green-500'
                            }
                          `}
                        >
                          {todo.completed && <span className="text-base sm:text-lg">✓</span>}
                        </button>

                        {/* 태그 색상 표시 */}
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${TAG_COLORS[todo.tag]}`} />

                        {/* 제목 */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`
                            font-semibold transition-all text-base sm:text-lg md:text-xl
                            ${todo.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-900'
                            }
                          `} style={{ lineHeight: '1.5' }}>
                            {todo.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </section>
  )
}