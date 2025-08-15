import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    setShowMenu(false)
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