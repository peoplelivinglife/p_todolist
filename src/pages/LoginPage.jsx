import { useAuth } from '../hooks/useAuth.jsx'
import { Navigate, Link } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { user, loading, error, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* 로고/제목 */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img 
                src="/pavicon.png" 
                alt="ducklylist logo" 
                className="w-10 h-10"
              />
              <h1 className="text-3xl font-bold text-gray-900">ducklylist</h1>
            </div>
            <p className="text-gray-600">느슨하지만 효율적으로 할 일을 관리하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google 로그인 버튼 */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google로 로그인</span>
          </button>

          {/* 설명 */}
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Google 계정으로 로그인하여 모든 기기에서<br/>
            할 일 목록을 동기화하세요
          </p>
          
          {/* 약관 동의 */}
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            로그인 시 <Link to="/terms" className="text-blue-500 hover:underline">이용약관</Link> 및 <Link to="/privacy" className="text-blue-500 hover:underline">개인정보처리방침</Link>에<br/>
            동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </div>
  )
}