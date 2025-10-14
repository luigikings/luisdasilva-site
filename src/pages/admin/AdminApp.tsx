import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminLoginPage } from './AdminLoginPage'

const TOKEN_STORAGE_KEY = 'pixel-interrogatorio-admin-token'

type AdminAuthContextValue = {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
)

function usePersistedToken() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  })

  const login = (value: string) => {
    setToken(value)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, value)
    }
  }

  const logout = () => {
    setToken(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  return { token, login, logout }
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAdminAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const persisted = usePersistedToken()

  const value = useMemo(
    () => ({
      token: persisted.token,
      login: persisted.login,
      logout: persisted.logout,
    }),
    [persisted.login, persisted.logout, persisted.token],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route
            path="*"
            element={
              <RequireAuth>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </AdminAuthProvider>
  )
}

export default AdminApp
