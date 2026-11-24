import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext = createContext(null)

// ============================================
// AUTH PROVIDER
// ============================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ============================================
  // RESTORE AUTHENTICATION ON PAGE REFRESH
  // ============================================
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Failed to restore authentication:', error)

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // ============================================
  // LOGIN AUTHENTICATION
  // ============================================
  const saveAuth = (authData) => {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))

    setToken(authData.token)
    setUser(authData.user)
  }

  // ============================================
  // UPDATE USER INFORMATION
  // ============================================
  const updateUser = (updatedUser) => {
    setUser(currentUser => {
      const newUser = {
        ...currentUser,
        ...updatedUser,
      }

      localStorage.setItem('user', JSON.stringify(newUser))

      return newUser
    })
  }

  // ============================================
  // LOGOUT
  // ============================================
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
    setToken(null)
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    authLoading,
    saveAuth,
    updateUser,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// CUSTOM AUTH HOOK
// ============================================
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    )
  }

  return context
}
