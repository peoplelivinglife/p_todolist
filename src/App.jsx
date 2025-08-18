import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import TopNav from './components/TopNav'
import BottomCTA from './components/BottomCTA'
import CalendarPage from './pages/CalendarPage'
import AddPage from './pages/AddPage'
import EditPage from './pages/EditPage'
import BacklogPage from './pages/BacklogPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import LoadingSpinner from './components/LoadingSpinner'
import { OfflineIndicator } from './components/OfflineIndicator'
import { trackPageView } from './utils/analytics'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function ShellLayout(){
  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-16 sm:pb-20 md:pb-24">
        <TopNav />
        <main className="container-narrow py-4 sm:py-6 md:py-8">
          <Outlet />
        </main>
        <BottomCTA />
      </div>
    </ProtectedRoute>
  )
}

// 페이지 뷰 추적을 위한 컴포넌트
function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // 페이지 타이틀 맵핑
    const pageTitles = {
      '/': '캘린더 - ducklylist',
      '/add': '할 일 추가 - ducklylist',
      '/edit': '할 일 편집 - ducklylist',
      '/backlog': '백로그 - ducklylist',
      '/login': '로그인 - ducklylist',
      '/privacy': '개인정보처리방침 - ducklylist',
      '/terms': '이용약관 - ducklylist'
    }

    const path = location.pathname
    const title = pageTitles[path] || pageTitles[path.split('/')[1]] || 'ducklylist'
    
    trackPageView(path, title)
  }, [location])

  return null
}

export default function App(){
  return (
    <AuthProvider>
      <PageTracker />
      <OfflineIndicator />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route element={<ShellLayout/>}>
          <Route path="/" element={<CalendarPage/>} />
          <Route path="/add" element={<AddPage/>} />
          <Route path="/edit/:id" element={<EditPage/>} />
          <Route path="/backlog" element={<BacklogPage/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}