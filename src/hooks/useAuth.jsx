import { useState, useEffect, useContext, createContext } from 'react'
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { trackUserLogin, trackUserLogout } from '../utils/analytics'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      setError(null)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      setError('Firebase authentication is not configured')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const result = await signInWithPopup(auth, googleProvider)
      console.log('Google sign in successful:', result.user.displayName)
      trackUserLogin() // Google Analytics 이벤트 추적
      return result.user
    } catch (err) {
      console.error('Google sign in error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!auth) return
    
    setLoading(true)
    setError(null)
    
    try {
      await firebaseSignOut(auth)
      console.log('Sign out successful')
      trackUserLogout() // Google Analytics 이벤트 추적
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}