/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { setUnauthorizedHandler, TOKEN_KEY } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const logout = useCallback(
    (showToast = true) => {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      if (showToast) {
        toast.success('Logged out')
      }
      navigate('/login', { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      toast.error('Session expired. Please login again.')
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const login = useCallback(
    async (username, password) => {
      setIsAuthenticating(true)
      try {
        const response = await api.post('/api/auth/login', { username, password })
        const receivedToken =
          response?.data?.token ||
          response?.data?.jwt ||
          response?.data?.accessToken ||
          response?.data?.data?.token

        if (!receivedToken) {
          throw new Error('Token was not present in login response')
        }

        localStorage.setItem(TOKEN_KEY, receivedToken)
        setToken(receivedToken)
        toast.success('Login successful')
        navigate('/dashboard', { replace: true })
      } finally {
        setIsAuthenticating(false)
      }
    },
    [navigate],
  )

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), isAuthenticating, login, logout }),
    [token, isAuthenticating, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
