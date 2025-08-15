import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getUserTodos, 
  updateUserTodo, 
  createWhereCondition
} from '../lib/firestore'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../hooks/useToast'
import { formatISODate } from '../utils/dateUtils'
import Calendar from '../components/Calendar'
import LoadingSpinner from '../components/LoadingSpinner'
import Toast from '../components/Toast'

const TAG_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500', 
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
}

export default function BacklogPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [overdueTodos, setOverdueTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateAssignPopover, setDateAssignPopover] = useState(null) // 어떤 todo의 팝오버인지
  const [activeTab, setActiveTab] = useState('undated') // 'undated' | 'overdue'
  const { toast, showToast, hideToast } = useToast()

  // 백로그 및 지연된 할일 조회
  useEffect(() => {
    if (user) {
      loadBacklogItems()
      loadOverdueItems()
    }
  }, [user]) // loadBacklogItems, loadOverdueItems는 컴포넌트 내부에서 정의된 안정적인 함수

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadBacklogItems()
        loadOverdueItems()
      }
    }

    const handleNavigation = () => {
      if (user) {
        // 네비게이션 후 약간의 지연을 두고 데이터 새로고침
        setTimeout(() => {
          loadBacklogItems()
          loadOverdueItems()
        }, 100)
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('pageshow', handleNavigation)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('pageshow', handleNavigation)
    }
  }, [user])

  const loadBacklogItems = async () => {
    setLoading(true)
    if (!user) {
      setTodos([])
      setLoading(false)
      return
    }
    
    try {
      const whereCondition = createWhereCondition('date', '==', null)
      // 인덱스 문제를 피하기 위해 orderBy 조건 제거
      const items = await getUserTodos(user.uid, [whereCondition])
      
      // 클라이언트 사이드에서 정렬
      const sortedItems = items.sort((a, b) => {
        if (a.order && b.order) return a.order - b.order
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
      })
      
      setTodos(sortedItems)
    } catch (error) {
      console.error('Error loading backlog:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 지연된 할일 조회 (오늘날짜 > 지정된 날짜 && 완료되지 않음)
  const loadOverdueItems = async () => {
    if (!user) {
      setOverdueTodos([])
      return
    }
    
    try {
      const whereCondition = createWhereCondition('date', '!=', null)
      // 인덱스 문제를 피하기 위해 orderBy 조건 제거
      const items = await getUserTodos(user.uid, [whereCondition])
      
      // 오늘 날짜
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 지연된 할일 필터링 (오늘보다 이전 날짜이고 완료되지 않은 것)
      const overdueItems = items.filter(todo => {
        if (todo.completed) return false // 완료된 것은 제외
        
        const todoDate = new Date(todo.date + 'T00:00:00')
        return todoDate < today // 오늘보다 이전 날짜
      })
      
      // 클라이언트 사이드에서 날짜순 정렬
      const sortedOverdueItems = overdueItems.sort((a, b) => {
        return new Date(a.date) - new Date(b.date)
      })
      
      setOverdueTodos(sortedOverdueItems)
    } catch (error) {
      console.error('Error loading overdue items:', error)
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
      
      // 지연된 할일에서 완료 처리 시 목록에서 제거
      if (activeTab === 'overdue' && !currentCompleted) {
        // 완료 처리되면 지연된 할일 목록에서 제거
        setOverdueTodos(prev => prev.filter(todo => todo.id !== todoId))
      } else {
        // 일반적인 상태 업데이트
        setOverdueTodos(prev => prev.map(todo => 
          todo.id === todoId 
            ? { ...todo, completed: !currentCompleted }
            : todo
        ))
      }
    } catch (error) {
      console.error('Error toggling completion:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
    }
  }

  // 날짜 배정
  const assignDate = async (todoId, date) => {
    if (!user) {
      showToast('로그인이 필요합니다', 'error')
      return
    }
    
    try {
      await updateUserTodo(user.uid, todoId, {
        date: formatISODate(date)
      })
      
      // 성공 시 리스트에서 제거
      setTodos(prev => prev.filter(todo => todo.id !== todoId))
      setOverdueTodos(prev => prev.filter(todo => todo.id !== todoId))
      setDateAssignPopover(null)
      
      // 토스트 표시
      showToast('할 일이 배정되었습니다', 'success')
      
    } catch (error) {
      console.error('Error assigning date:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
    }
  }

  const goBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg">
            ←
          </button>
          <h2 className="text-xl font-semibold">백로그</h2>
        </div>
        <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
          <LoadingSpinner />
          로딩 중...
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        {/* 상단 바 */}
        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button 
            onClick={goBack}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-xl sm:text-2xl md:text-3xl">←</span>
          </button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">백로그</h2>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('undated')}
            className={`
              flex-1 py-3 px-4 text-center font-medium transition-colors relative
              ${activeTab === 'undated'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <span className="text-base sm:text-lg">날짜 미지정</span>
            {todos.length > 0 && (
              <span className={`
                ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                ${activeTab === 'undated' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}
              `}>
                {todos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`
              flex-1 py-3 px-4 text-center font-medium transition-colors relative
              ${activeTab === 'overdue'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <span className="text-base sm:text-lg">지연된 할일</span>
            {overdueTodos.length > 0 && (
              <span className={`
                ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                ${activeTab === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'}
              `}>
                {overdueTodos.length}
              </span>
            )}
          </button>
        </div>

        {/* 할 일 리스트 */}
        {activeTab === 'undated' ? (
          todos.length === 0 ? (
            <div className="text-center" style={{ padding: '48px 0' }}>
              <div className="text-gray-500">
                <p className="text-lg sm:text-xl md:text-2xl mb-3">백로그가 비어있습니다</p>
                <p className="text-base sm:text-lg">날짜를 정하지 않은 할 일들이 여기에 표시됩니다</p>
                <p className="text-sm sm:text-base mt-4 text-gray-400">아래 버튼을 눌러 할 일을 추가해보세요</p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              {todos.map(todo => (
                <div key={todo.id} className="relative mb-4">
                <div className="card hover:shadow-md transition-shadow" style={{ padding: '16px', marginBottom: '16px' }}>
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

                    {/* 편집 버튼 */}
                    <button
                      onClick={() => navigate(`/edit/${todo.id}`)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="text-base sm:text-lg">✏️</span>
                    </button>

                    {/* 날짜 배정 버튼 */}
                    <button
                      onClick={() => setDateAssignPopover(
                        dateAssignPopover === todo.id ? null : todo.id
                      )}
                      className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="text-xl sm:text-2xl">📅</span>
                    </button>
                  </div>
                </div>

                {/* 날짜 배정 팝오버 */}
                {dateAssignPopover === todo.id && (
                  <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 z-10">
                    <div className="bg-white shadow-lg rounded-lg border max-w-sm mx-auto sm:mx-0">
                      <Calendar 
                        selectedDate={new Date()}
                        onDateSelect={(date) => assignDate(todo.id, date)}
                      />
                    </div>
                  </div>
                )}
                </div>
              ))}
            </div>
          )
        ) : (
          overdueTodos.length === 0 ? (
            <div className="text-center" style={{ padding: '48px 0' }}>
              <div className="text-gray-500">
                <p className="text-lg sm:text-xl md:text-2xl mb-3">지연된 할일이 없습니다</p>
                <p className="text-base sm:text-lg">오늘 날짜를 지난 미완료 할일들이 여기에 표시됩니다</p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              {overdueTodos.map(todo => (
                <div key={todo.id} className="relative mb-4">
                  <div className="card hover:shadow-md transition-shadow" style={{ padding: '16px', marginBottom: '16px' }}>
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

                      {/* 제목과 날짜 정보 */}
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
                        <p className="text-sm sm:text-base text-red-600 mt-1">
                          📅 {todo.date} (지연됨)
                        </p>
                      </div>

                      {/* 편집 버튼 */}
                      <button
                        onClick={() => navigate(`/edit/${todo.id}`)}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                      >
                        <span className="text-base sm:text-lg">✏️</span>
                      </button>

                      {/* 날짜 배정 버튼 */}
                      <button
                        onClick={() => setDateAssignPopover(
                          dateAssignPopover === todo.id ? null : todo.id
                        )}
                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                      >
                        <span className="text-xl sm:text-2xl">📅</span>
                      </button>
                    </div>
                  </div>

                  {/* 날짜 배정 팝오버 */}
                  {dateAssignPopover === todo.id && (
                    <div className="absolute top-full right-0 sm:right-0 left-0 sm:left-auto mt-2 z-10">
                      <div className="bg-white shadow-lg rounded-lg border max-w-sm mx-auto sm:mx-0">
                        <Calendar 
                          selectedDate={new Date()}
                          onDateSelect={(date) => assignDate(todo.id, date)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

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

      {/* 팝오버 외부 클릭 시 닫기 */}
      {dateAssignPopover && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setDateAssignPopover(null)}
        />
      )}
    </section>
  )
}