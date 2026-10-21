import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('rental_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  function saveLogin(loginResult) {
    localStorage.setItem('rental_token', loginResult.access_token)
    localStorage.setItem('rental_user', JSON.stringify(loginResult.user))
    setUser(loginResult.user)
  }

  function logout() {
    localStorage.removeItem('rental_token')
    localStorage.removeItem('rental_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, saveLogin, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
