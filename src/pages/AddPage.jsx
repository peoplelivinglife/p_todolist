import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format, parse, addDays, subDays } from 'date-fns'
import { useDateContext } from '../hooks/useDateContext'
import { addDoc } from '../lib/firebase'
import { addUserTodo } from '../lib/firestore'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../hooks/useToast'
import { formatISODate } from '../utils/dateUtils'
import Calendar from '../components/Calendar'
import Toast from '../components/Toast'
import { trackTodoEvent } from '../utils/analytics'

const TAG_COLORS = [
  { id: 'blue', name: '파랑', class: 'bg-blue-500', border: 'border-blue-500' },
  { id: 'green', name: '초록', class: 'bg-green-500', border: 'border-green-500' },
  { id: 'yellow', name: '노랑', class: 'bg-yellow-500', border: 'border-yellow-500' },
  { id: 'red', name: '빨강', class: 'bg-red-500', border: 'border-red-500' }
]

export default function AddPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSelectedDate } = useDateContext()
  const { user } = useAuth()
  const titleInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    tag: TAG_COLORS[0].id
  })

  const [showCalendar, setShowCalendar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateManuallyChanged, setDateManuallyChanged] = useState(false) // 사용자가 수동으로 날짜 변경했는지 추적
  const { toast, showToast, hideToast } = useToast()


  // 초기값 설정 및 키보드 이벤트 처리
  useEffect(() => {
    // 사용자가 수동으로 날짜를 변경한 경우 URL 파라미터 무시
    if (dateManuallyChanged) {
      return
    }
    
    const dateParam = searchParams.get('date')
    if (dateParam) {
      try {
        const parsedDate = parse(dateParam, 'yyyy.MM.dd', new Date())
        setFormData(prev => ({ ...prev, date: parsedDate }))
      } catch {
        // 잘못된 날짜 형식이면 오늘 날짜 사용
        setFormData(prev => ({ ...prev, date: new Date() }))
      }
    }
    // 백로그에서 온 경우 (date 파라미터가 없는 경우) null로 설정
    else if (window.location.pathname === '/add' && !dateParam) {
      setFormData(prev => ({ ...prev, date: null }))
    }
    
    // 자동 포커스
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }

    // 키보드 이벤트 핸들러
    const handleKeyDown = (e) => {
      // Esc 키로 팝오버 닫기
      if (e.key === 'Escape' && showCalendar) {
        setShowCalendar(false)
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchParams, showCalendar, dateManuallyChanged])

  const handleTitleChange = (e) => {
    const value = e.target.value
    if (value.length <= 60) {
      setFormData(prev => ({ ...prev, title: value }))
      setError('')
    }
  }

  const handleDateSelect = (date) => {
    setDateManuallyChanged(true) // 사용자가 수동으로 날짜 변경했음을 표시
    setFormData(prev => ({ ...prev, date }))
    setShowCalendar(false)
  }

  const goToPrevDay = () => {
    setDateManuallyChanged(true)
    setFormData(prev => ({ ...prev, date: subDays(prev.date, 1) }))
  }

  const goToNextDay = () => {
    setDateManuallyChanged(true)
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
      console.log('Attempting to save todo:', {
        user: user ? user.uid : 'no user',
        title: formData.title.trim(),
        date: formData.date ? formatISODate(formData.date) : null,
        tag: formData.tag
      })

      // 실제 Firebase를 사용할 수 있는 경우 사용자별 데이터 저장
      if (user) {
        console.log('Saving to Firebase with user:', user.uid)
        await addUserTodo(user.uid, {
          title: formData.title.trim(),
          date: formData.date ? formatISODate(formData.date) : null,
          tag: formData.tag,
          completed: false
        })
      } else {
        // Mock 모드
        console.log('Saving to mock mode')
        await addDoc('todos', {
          title: formData.title.trim(),
          date: formData.date ? formatISODate(formData.date) : null,
          tag: formData.tag,
          completed: false,
          createdAt: new Date()
        })
      }

      // Google Analytics 이벤트 추적
      trackTodoEvent('todo_create', {
        hasDate: !!formData.date,
        tag: formData.tag
      })

      // 성공 토스트 표시
      showToast('할 일이 등록되었습니다', 'success')

      // 성공 시 이동 처리
      if (formData.date) {
        // 날짜가 있으면 홈으로 이동하고 날짜 동기화
        setSelectedDate(formData.date)
        navigate('/')
      } else {
        // 날짜가 없으면 백로그로 이동
        navigate('/backlog')
      }
    } catch (err) {
      console.error('Error adding todo:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      })
      showToast(`네트워크 오류: ${err.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Enter 키로 등록하기 (유효할 때만)
  const handleKeyPress = (e) => {
    const isValid = formData.title.trim().length > 0
    if (e.key === 'Enter' && isValid && !isLoading) {
      handleSubmit(e)
    }
  }

  const goBack = () => {
    navigate(-1) // 이전 페이지로 돌아가기
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

          {/* 중앙 날짜/제목 영역 */}
          {formData.date ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={goToPrevDay}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-lg sm:text-xl md:text-2xl">◀</span>
              </button>
              <div className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-base sm:text-lg md:text-xl text-center bg-gray-50 rounded-lg min-w-[140px] sm:min-w-[160px]">
                {format(new Date(formData.date), 'yyyy.MM.dd')}
              </div>
              <button 
                onClick={goToNextDay}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-lg sm:text-xl md:text-2xl">▶</span>
              </button>
            </div>
          ) : (
            <div className="px-6 py-3 font-semibold text-gray-600 text-base sm:text-lg md:text-xl bg-gray-50 rounded-lg">
              백로그 항목 추가
            </div>
          )}

          {/* 우측 빈 공간 (대칭을 위해) */}
          <div className="w-12 h-12 sm:w-14 sm:h-14"></div>
        </div>

        {/* 폼 */}
        <form id="add-form" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
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
                onKeyPress={handleKeyPress}
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
                <div 
                  className={`px-4 py-3 border rounded-lg flex-1 text-base sm:text-lg cursor-pointer ${
                    formData.date 
                      ? 'border-gray-300 bg-gray-50' 
                      : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                  }`}
                  style={{ minHeight: '48px', display: 'flex', alignItems: 'center' }}
                  onClick={() => !formData.date && setShowCalendar(true)}
                >
                  {formData.date ? (
                    <span>
                      {format(new Date(formData.date), 'yyyy.MM.dd')}
                    </span>
                  ) : (
                    <span className="text-blue-600">
                      📅 날짜 선택하기 (현재: 백로그)
                    </span>
                  )}
                </div>
                {/* 항상 캘린더 버튼 표시 */}
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <span className="text-xl sm:text-2xl">📅</span>
                </button>
                {/* 날짜가 설정된 경우에만 제거 버튼 표시 */}
                {formData.date && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateManuallyChanged(true)
                      setFormData(prev => ({ ...prev, date: null }))
                    }}
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
                  <div className="absolute top-2 left-0 right-0 sm:left-0 sm:right-auto z-50 bg-white shadow-lg rounded-lg border max-w-sm mx-auto sm:mx-0">
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