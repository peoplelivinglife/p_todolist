import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getDocs, 
  updateDoc, 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  db 
} from '../lib/firebase'
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
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateAssignPopover, setDateAssignPopover] = useState(null) // 어떤 todo의 팝오버인지
  const { toast, showToast, hideToast } = useToast()

  // 백로그 아이템 조회
  useEffect(() => {
    loadBacklogItems()
  }, []) // loadBacklogItems는 컴포넌트 내부에서 정의된 안정적인 함수

  const loadBacklogItems = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'todos'),
        where('date', '==', null),
        orderBy('order', 'asc')
      )
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTodos(items)
    } catch (error) {
      console.error('Error loading backlog:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 완료 상태 토글
  const toggleCompleted = async (todoId, currentCompleted) => {
    try {
      const todoRef = doc(db, 'todos', todoId)
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

  // 날짜 배정
  const assignDate = async (todoId, date) => {
    try {
      const todoRef = doc(db, 'todos', todoId)
      await updateDoc(todoRef, {
        date: formatISODate(date),
        updatedAt: new Date()
      })
      
      // 성공 시 리스트에서 제거
      setTodos(prev => prev.filter(todo => todo.id !== todoId))
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

  const goToAdd = () => {
    navigate('/add') // 백로그는 날짜 없이 추가
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

        {/* 할 일 리스트 */}
        {todos.length === 0 ? (
          <div className="text-center" style={{ padding: '48px 0' }}>
            <div className="text-gray-500 mb-6">
              <p className="text-lg sm:text-xl md:text-2xl mb-3">백로그가 비어있습니다</p>
              <p className="text-base sm:text-lg">날짜를 정하지 않은 할 일들이 여기에 표시됩니다</p>
            </div>
            <button
              onClick={goToAdd}
              className="bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors rounded-lg text-lg sm:text-xl font-medium"
              style={{ 
                padding: '16px 32px',
                minHeight: '56px'
              }}
            >
              + 할 일 추가하기
            </button>
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
                      <div className="p-4 border-b">
                        <p className="text-base sm:text-lg font-medium text-gray-700">날짜 선택</p>
                      </div>
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
        )}

        {/* 하단 추가 버튼 */}
        {todos.length > 0 && (
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={goToAdd}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors w-full rounded-lg text-lg sm:text-xl font-medium"
              style={{ 
                padding: '16px 24px',
                minHeight: '56px'
              }}
            >
              + 추가하기
            </button>
          </div>
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