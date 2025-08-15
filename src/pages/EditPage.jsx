import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, addDays, subDays } from 'date-fns'
import { useDateContext } from '../hooks/useDateContext'
import { getUserTodos, updateUserTodo, deleteUserTodo } from '../lib/firestore'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../hooks/useToast'
import { formatISODate, fromISO } from '../utils/dateUtils'
import Calendar from '../components/Calendar'
import Toast from '../components/Toast'
import { trackTodoEvent } from '../utils/analytics'

const TAG_COLORS = [
  { id: 'blue', name: '파랑', class: 'bg-blue-500', border: 'border-blue-500' },
  { id: 'green', name: '초록', class: 'bg-green-500', border: 'border-green-500' },
  { id: 'yellow', name: '노랑', class: 'bg-yellow-500', border: 'border-yellow-500' },
  { id: 'red', name: '빨강', class: 'bg-red-500', border: 'border-red-500' }
]

export default function EditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const { setSelectedDate } = useDateContext()
  const titleInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    tag: TAG_COLORS[0].id
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast, showToast, hideToast } = useToast()

  // 할 일 데이터 불러오기
  useEffect(() => {
    if (user) {
      loadTodoData()
    }
  }, [id, user])

  const loadTodoData = async () => {
    setLoading(true)
    if (!user) {
      setLoading(false)
      showToast('로그인이 필요합니다', 'error')
      navigate('/')
      return
    }
    
    try {
      // 사용자의 모든 할 일을 가져와서 ID로 찾기
      const todos = await getUserTodos(user.uid)
      const todo = todos.find(t => t.id === id)
      
      if (todo) {
        setFormData({
          title: todo.title,
          date: todo.date ? new Date(todo.date + 'T00:00:00') : null,
          tag: todo.tag
        })
      } else {
        showToast('할 일을 찾을 수 없습니다', 'error')
        navigate('/')
      }
    } catch (error) {
      console.error('Error loading todo:', error)
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  // 초기 포커스
  useEffect(() => {
    if (!loading && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [loading])

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showCalendar) {
        setShowCalendar(false)
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showCalendar])

  const handleTitleChange = (e) => {
    const value = e.target.value
    if (value.length <= 60) {
      setFormData(prev => ({ ...prev, title: value }))
      setError('')
    }
  }

  const handleDateSelect = (date) => {
    setFormData(prev => ({ ...prev, date }))
    setShowCalendar(false)
  }

  const goToPrevDay = () => {
    setFormData(prev => ({ ...prev, date: subDays(prev.date, 1) }))
  }

  const goToNextDay = () => {
    setFormData(prev => ({ ...prev, date: addDays(prev.date, 1) }))
  }

  const handleTagSelect = (tagId) => {
    setFormData(prev => ({ ...prev, tag: tagId }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const isValid = formData.title.trim().length > 0
    if (!isValid) {
      setError('제목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (!user) {
        showToast('로그인이 필요합니다', 'error')
        return
      }
      
      await updateUserTodo(user.uid, id, {
        title: formData.title.trim(),
        date: formData.date ? formatISODate(formData.date) : null,
        tag: formData.tag
      })

      // Google Analytics 이벤트 추적
      trackTodoEvent('todo_update', {
        hasDate: !!formData.date,
        tag: formData.tag
      })

      showToast('할 일이 수정되었습니다', 'success')

      // 성공 시 이동 처리
      if (formData.date) {
        setSelectedDate(formData.date)
        navigate('/')
      } else {
        navigate('/backlog')
      }
    } catch (err) {
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
      console.error('Error updating todo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    setIsLoading(true)

    try {
      if (!user) {
        showToast('로그인이 필요합니다', 'error')
        return
      }
      
      await deleteUserTodo(user.uid, id)

      // Google Analytics 이벤트 추적
      trackTodoEvent('todo_delete', {})

      showToast('할 일이 삭제되었습니다', 'success')
      navigate('/')
    } catch (err) {
      showToast('네트워크 오류, 다시 시도해주세요', 'error')
      console.error('Error deleting todo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <section style={{ marginBottom: '80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="px-6 py-3 font-semibold text-gray-600 text-base sm:text-lg md:text-xl bg-gray-50 rounded-lg">
              로딩 중...
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          {/* 뒤로가기 버튼 */}
          <button 
            onClick={goBack}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <span className="text-xl sm:text-2xl md:text-3xl">←</span>
          </button>

          {/* 중앙 제목 영역 */}
          <div className="px-6 py-3 font-semibold text-gray-600 text-base sm:text-lg md:text-xl bg-gray-50 rounded-lg">
            할 일 편집
          </div>

          {/* 삭제 버튼 */}
          <button 
            onClick={handleDelete}
            className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <span className="text-xl sm:text-2xl md:text-3xl text-red-500">🗑️</span>
          </button>
        </div>

        {/* 날짜 네비게이션 (날짜가 있을 때만) */}
        {formData.date && (
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={goToPrevDay}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-lg sm:text-xl md:text-2xl">◀</span>
              </button>
              <div className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-base sm:text-lg md:text-xl text-center bg-gray-50 rounded-lg min-w-[140px] sm:min-w-[160px]">
                {format(formData.date, 'yyyy.MM.dd')}
              </div>
              <button 
                onClick={goToNextDay}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-lg sm:text-xl md:text-2xl">▶</span>
              </button>
            </div>
          </div>
        )}

        {/* 폼 */}
        <form id="edit-form" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            {/* 제목 입력 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                해야할 일
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="해야할 일을 입력하세요"
                className="input"
                disabled={isLoading}
                style={{ 
                  padding: '12px 16px', 
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              />
              <div className="text-sm sm:text-base text-gray-500 mt-2">
                {formData.title.length}/60자
              </div>
            </div>

            {/* 날짜 선택 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                날짜
              </label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex-1 text-base sm:text-lg" style={{ minHeight: '48px', display: 'flex', alignItems: 'center' }}>
                  {formData.date ? format(formData.date, 'yyyy.MM.dd') : '날짜 미정 (백로그)'}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <span className="text-xl sm:text-2xl">📅</span>
                </button>
                {formData.date && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, date: null }))}
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg text-red-500 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-xl sm:text-2xl">✕</span>
                  </button>
                )}
              </div>
              
              {/* 달력 팝오버 */}
              {showCalendar && (
                <div className="relative mt-2">
                  <div className="absolute top-2 left-0 right-0 sm:left-0 sm:right-auto z-10 bg-white shadow-lg rounded-lg border max-w-sm mx-auto sm:mx-0">
                    <Calendar 
                      selectedDate={formData.date || new Date()}
                      onDateSelect={handleDateSelect}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 태그 선택 */}
            <div style={{ marginBottom: '32px' }}>
              <label className="block text-base sm:text-lg font-medium text-gray-700 mb-3">
                태그
              </label>
              <div className="flex gap-4 sm:gap-6">
                {TAG_COLORS.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagSelect(tag.id)}
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 transition-all
                      ${tag.class}
                      ${formData.tag === tag.id 
                        ? `${tag.border} ring-2 ring-offset-2 ring-gray-400` 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                    disabled={isLoading}
                    title={tag.name}
                  />
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-600 text-base sm:text-lg mb-4">
                {error}
              </div>
            )}
          </div>
        </form>
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