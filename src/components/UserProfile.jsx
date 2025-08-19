import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePWA } from '../hooks/usePWA'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const { isInstallable, isStandalone, platform, installPWA } = usePWA()
  const [showMenu, setShowMenu] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    setShowMenu(false)
  }

  const handleInstallApp = async () => {
    if (platform === 'chrome' || platform === 'android') {
      const success = await installPWA()
      if (success) {
        setShowMenu(false)
      }
    }
  }

  const getInstallText = () => {
    switch (platform) {
      case 'ios':
        return 'Safari에서 공유 → 홈 화면에 추가'
      case 'android':
        return '앱으로 설치하기'
      case 'chrome':
        return '데스크톱 앱으로 설치하기'
      default:
        return '앱으로 설치하기'
    }
  }

  const shouldShowInstallButton = () => {
    if (isStandalone) return false
    
    switch (platform) {
      case 'ios':
        return true // iOS는 항상 안내 표시
      case 'chrome':
      case 'android':
        return isInstallable // Chrome/Android는 beforeinstallprompt 이벤트가 있을 때만
      default:
        return false
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {user.displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              {/* PWA 설치 버튼 임시 비활성화 */}
              {/* {shouldShowInstallButton() && (
                <button
                  onClick={handleInstallApp}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-1 flex items-center gap-2"
                >
                  <span>📱</span>
                  <span className="flex-1">{getInstallText()}</span>
                  {platform === 'ios' && (
                    <span className="text-xs text-gray-400">안내</span>
                  )}
                </button>
              )} */}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}