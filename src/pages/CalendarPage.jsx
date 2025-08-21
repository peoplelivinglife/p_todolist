import { useState, useEffect } from 'react'
import { addDays, subDays, format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { useDateContext } from '../hooks/useDateContext'
import { updateUserTodo, getUserTodos, createWhereCondition, addUserVisit, getUserVisits } from '../lib/firestore'
import { useAuth } from '../hooks/useAuth.jsx'
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
  const { user } = useAuth()
  const [showCalendar, setShowCalendar] = useState(false)
  const [todos, setTodos] = useState([])
  const [allTodos, setAllTodos] = useState([]) // 캘린더 표시용 전체 할 일 데이터
  const [visits, setVisits] = useState([]) // 사용자 방문 기록
  const [visitsLoading, setVisitsLoading] = useState(true) // 방문 기록 로딩 상태
  const [loading, setLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  const navigate = useNavigate()

  // 연속출석일 계산 함수 (사용자 방문 기록 기반)
  const calculateStreakDays = () => {
    if (!visits.length) return 0
    
    // 방문한 날짜들을 추출하고 정렬
    const visitDates = [...new Set(visits.map(visit => visit.date))].sort()
    
    if (visitDates.length === 0) return 0
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    // 오늘부터 역순으로 연속일 계산
    while (true) {
      const dateString = formatISODate(currentDate)
      if (visitDates.includes(dateString)) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // 연속출석일에 따른 메시지 생성
  const getStreakMessage = (days) => {
    if (days === 0) return null
    
    let message = ""
    if (days <= 3) {
      message = "작심삼일을 반복하면 그게 습관이죠!"
    } else if (days <= 7) {
      message = "습관이 되고 있덕!🦆"
    } else if (days <= 30) {
      message = "일주일이 넘었네요. 혹시 J인가요?"
    } else {
      message = "습관이 되었네요. 나날이 발전하는 모습이 느껴져요!🦆"
    }
    
    return `연속 출석 ${days}일 째! ${message}`
  }

  // 사용자 방문 기록
  useEffect(() => {
    if (user) {
      const initializeVisits = async () => {
        await loadUserVisits()
        await recordUserVisit()
      }
      initializeVisits()
    }
  }, [user])

  // 선택된 날짜의 할 일 불러오기
  useEffect(() => {
    if (user) {
      loadTodosForDate(selectedDate)
    }
  }, [selectedDate, user])

  // 전체 할 일 불러오기 (캘린더 표시용)
  useEffect(() => {
    if (user) {
      loadAllTodos()
    }
  }, [user])

  // 페이지에 포커스가 돌아올 때와 페이지가 표시될 때 데이터 새로고침
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadTodosForDate(selectedDate)
        loadAllTodos() // 전체 할 일도 새로고침
        loadUserVisits() // 방문 기록도 새로고침
      }
    }

    const handleFocus = () => {
      if (user) {
        loadTodosForDate(selectedDate)
        loadAllTodos() // 전체 할 일도 새로고침
        loadUserVisits() // 방문 기록도 새로고침
      }
    }

    const handleNavigation = () => {
      if (user) {
        // 네비게이션 후 약간의 지연을 두고 데이터 새로고침
        setTimeout(() => {
          loadTodosForDate(selectedDate)
          loadAllTodos()
          loadUserVisits() // 방문 기록도 새로고침
        }, 100)
      }
    }

    // 페이지가 표시될 때도 새로고침
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handleNavigation)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handleNavigation)
    }
  }, [selectedDate, user])

  const loadUserVisits = async () => {
    if (!user) {
      setVisits([])
      setVisitsLoading(false)
      return
    }
    
    try {
      const visitData = await getUserVisits(user.uid)
      console.log('Loaded user visits:', visitData)
      setVisits(visitData)
    } catch (error) {
      console.error('Error loading user visits:', error)
      setVisits([])
    } finally {
      setVisitsLoading(false)
    }
  }

  const recordUserVisit = async () => {
    if (!user) return
    
    try {
      const today = formatISODate(new Date())
      
      // 오늘 이미 방문 기록이 있는지 확인
      const existingVisit = visits.find(visit => visit.date === today)
      if (!existingVisit) {
        await addUserVisit(user.uid, today)
        // 방문 기록을 다시 로드하여 상태 업데이트
        await loadUserVisits()
      }
    } catch (error) {
      console.error('Error recording user visit:', error)
    }
  }

  const loadAllTodos = async () => {
    if (!user) {
      setAllTodos([])
      return
    }
    
    try {
      const whereCondition = createWhereCondition('date', '!=', null) // 날짜가 null이 아닌 모든 할 일
      const items = await getUserTodos(user.uid, [whereCondition])
      console.log('Loaded all todos for calendar:', items)
      setAllTodos(items)
    } catch (error) {
      console.error('Error loading all todos:', error)
      setAllTodos([])
    }
  }

  const loadTodosForDate = async (date) => {
    setLoading(true)
    if (!user) {
      setTodos([])
      setLoading(false)
      return
    }
    
    try {
      const dateString = formatISODate(date)
      console.log('Loading todos for date:', dateString, 'for user:', user.uid)
      
      const whereCondition = createWhereCondition('date', '==', dateString)
      // 인덱스 문제를 피하기 위해 orderBy 조건 제거
      const items = await getUserTodos(user.uid, [whereCondition])
      
      // 클라이언트 사이드에서 정렬
      const sortedItems = items.sort((a, b) => {
        if (a.order && b.order) return a.order - b.order
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
      })
      
      console.log('Loaded todos:', sortedItems)
      setTodos(sortedItems)
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
    if (!user) {
      showToast('로그인이 필요합니다', 'error')
      return
    }
    
    try {
      await updateUserTodo(user.uid, todoId, {
        completed: !currentCompleted
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

        {/* 연속출석일 메시지 */}
        {(() => {
          if (visitsLoading) {
            return (
              <div className="mb-6 sm:mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600">
                  연속출석일 확인 중...
                </p>
              </div>
            )
          }
          
          const streakDays = calculateStreakDays()
          const streakMessage = getStreakMessage(streakDays)
          console.log('Streak days:', streakDays, 'Message:', streakMessage, 'Visits:', visits)
          
          return streakMessage ? (
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm sm:text-base md:text-lg font-medium text-blue-800">
                {streakMessage}
              </p>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600">
                첫 방문이시군요! 꾸준히 방문해서 연속출석 기록을 쌓아보세요 🦆
              </p>
            </div>
          )
        })()}

        {/* 본문 */}
        <div style={{ minHeight: '400px' }} className="sm:min-h-[500px] md:min-h-[600px]">
          {/* 캘린더 (확장시에만 표시) */}
          {showCalendar && (
            <div className="w-full max-w-md mx-auto sm:max-w-lg mb-6 sm:mb-8">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                todosData={allTodos}
              />
            </div>
          )}

          {/* 할 일 목록 (항상 표시) */}
          <div>
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
                    <div className="flex items-start gap-4">
                      {/* 완료 체크박스 */}
                      <button
                        onClick={() => toggleCompleted(todo.id, todo.completed)}
                        className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-1
                          ${todo.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400 active:border-green-500'
                          }
                        `}
                      >
                        {todo.completed && <span className="text-base sm:text-lg">✓</span>}
                      </button>

                      {/* 태그 색상 표시 */}
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 mt-2 ${TAG_COLORS[todo.tag]}`} />

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
                        
                        {/* 체크리스트 표시 */}
                        {todo.checklist && todo.checklist.length > 0 && (
                          <div className="mt-3 space-y-2 ml-2">
                            {todo.checklist.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={async (e) => {
                                    // 체크리스트 항목 업데이트 로직
                                    const updatedChecklist = todo.checklist.map(checkItem => 
                                      checkItem.id === item.id ? { ...checkItem, completed: e.target.checked } : checkItem
                                    )
                                    
                                    try {
                                      await updateUserTodo(user.uid, todo.id, { checklist: updatedChecklist })
                                      
                                      // 로컬 상태 업데이트
                                      setTodos(prev => prev.map(t => 
                                        t.id === todo.id ? { ...t, checklist: updatedChecklist } : t
                                      ))
                                      
                                      // 체크리스트 상태에 따른 할일 완료/미완료 자동 처리
                                      const hasChecklist = updatedChecklist.length > 0
                                      const allCompleted = updatedChecklist.every(checkItem => checkItem.completed)
                                      const hasIncomplete = updatedChecklist.some(checkItem => !checkItem.completed)
                                      
                                      if (hasChecklist) {
                                        if (allCompleted && !todo.completed) {
                                          // 모든 체크리스트 완료 → 할일 자동 완료
                                          await updateUserTodo(user.uid, todo.id, { completed: true })
                                          setTodos(prev => prev.map(t => 
                                            t.id === todo.id ? { ...t, completed: true } : t
                                          ))
                                        } else if (hasIncomplete && todo.completed) {
                                          // 체크리스트 중 하나라도 미완료 → 할일 미완료로 변경
                                          await updateUserTodo(user.uid, todo.id, { completed: false })
                                          setTodos(prev => prev.map(t => 
                                            t.id === todo.id ? { ...t, completed: false } : t
                                          ))
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error updating checklist:', error)
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 편집 버튼 */}
                      <button
                        onClick={() => navigate(`/edit/${todo.id}?from=calendar&date=${formatISODate(selectedDate)}`)}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors flex-shrink-0 mt-1"
                      >
                        <span className="text-base sm:text-lg">✏️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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