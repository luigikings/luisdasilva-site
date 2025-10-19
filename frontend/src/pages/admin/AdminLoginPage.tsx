import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'

import { login } from '../../lib/api'
import { useAdminAuth } from './AdminApp'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: Location } | undefined
  const { login: setToken, token } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (token) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const response = await login(email, password)
      setToken(response.token)
      const from = state?.from
      if (from && typeof from === 'object' && 'pathname' in from) {
        navigate(from.pathname)
      } else {
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      console.error(err)
      setError('No se pudieron validar las credenciales. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="font-pixel text-xl uppercase tracking-[0.4em] text-highlight">
            Panel Admin
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ingresa tus credenciales para acceder al dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-highlight"
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-highlight"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-highlight py-2 font-pixel text-xs uppercase tracking-[0.35em] text-charcoal transition-colors hover:bg-highlight/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLoginPage
