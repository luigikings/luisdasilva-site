import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  deleteAdminSuggestion,
  getAdminQuestions,
  getAdminSuggestions,
  getMetrics,
} from '../../services/adminApi'
import { ApiError } from '../../services/http'
import type { MetricsSummary, Question, Suggestion } from '../../types/api'
import { useAdminAuth } from './AdminApp'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { token, logout } = useAdminAuth()
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingSuggestionIds, setDeletingSuggestionIds] = useState<Set<number>>(
    () => new Set(),
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-ES'), [])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [],
  )

  const fetchData = useCallback(async () => {
    if (!token) {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [metricsResponse, questionsResponse, suggestionsResponse] =
        await Promise.all([
          getMetrics(),
          getAdminQuestions(token),
          getAdminSuggestions(token),
        ])
      setMetrics(metricsResponse)
      setQuestions(questionsResponse)
      setSuggestions(suggestionsResponse)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        navigate('/admin/login', { replace: true })
        return
      }
      console.error(err)
      setError('No se pudo cargar la información. Intenta nuevamente más tarde.')
    } finally {
      setIsLoading(false)
    }
  }, [logout, navigate, token])

  useEffect(() => {
    let active = true
    const load = async () => {
      await fetchData()
    }
    if (active) {
      void load()
    }
    return () => {
      active = false
    }
  }, [fetchData])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const handleRefresh = () => {
    void fetchData()
  }

  const handleDeleteSuggestion = async (id: number) => {
    if (!token) {
      return
    }

    const suggestion = suggestions.find((item) => item.id === id)
    if (!suggestion || suggestion.status !== 'pending') {
      return
    }

    setDeletingSuggestionIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

    try {
      setError(null)
      await deleteAdminSuggestion(token, id)
      setSuggestions((prev) => prev.filter((item) => item.id !== id))
      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              pendingSuggestions: Math.max(prev.pendingSuggestions - 1, 0),
            }
          : prev,
      )
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar la sugerencia. Intenta nuevamente más tarde.')
    } finally {
      setDeletingSuggestionIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const activeQuestions = useMemo(() => {
    return questions
      .filter((question) => question.isActive)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
  }, [questions])

  const recentSuggestions = useMemo(() => {
    return [...suggestions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [suggestions])

  const clicksByCategoryEntries = useMemo(() => {
    if (!metrics) {
      return []
    }
    return Object.entries(metrics.clicksByCategory).sort((a, b) => b[1] - a[1])
  }, [metrics])

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-2xl uppercase tracking-[0.5em] text-highlight">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Visualiza las métricas y el desempeño de las preguntas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full border border-highlight/70 px-4 py-2 text-xs font-pixel uppercase tracking-[0.3em] text-highlight transition-colors hover:bg-highlight/10"
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando…' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-slate-800 px-4 py-2 text-xs font-pixel uppercase tracking-[0.3em] text-slate-200 transition-colors hover:bg-slate-700"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clicks totales</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">
            {metrics ? numberFormatter.format(metrics.totalClicks) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preguntas activas</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">
            {isLoading
              ? '—'
              : numberFormatter.format(activeQuestions.length)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sugerencias pendientes</p>
          <p className="mt-3 text-3xl font-semibold text-slate-100">
            {metrics ? numberFormatter.format(metrics.pendingSuggestions) : '—'}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                Preguntas activas
              </h2>
              <span className="text-xs text-slate-500">
                Total: {numberFormatter.format(activeQuestions.length)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Pregunta</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2 text-right">Clicks</th>
                    <th className="px-3 py-2">Último clic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td className="px-3 py-6" colSpan={4}>
                        <p className="text-center text-sm text-slate-500">
                          Cargando preguntas…
                        </p>
                      </td>
                    </tr>
                  ) : activeQuestions.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6" colSpan={4}>
                        <p className="text-center text-sm text-slate-500">
                          No hay preguntas activas registradas.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    activeQuestions.map((question) => (
                      <tr key={question.id}>
                        <td className="px-3 py-3 text-slate-100">{question.text}</td>
                        <td className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {question.category}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-highlight">
                          {numberFormatter.format(question.clickCount)}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {dateFormatter.format(new Date(question.updatedAt))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                Preguntas sugeridas
              </h2>
              <span className="text-xs text-slate-500">
                Total: {numberFormatter.format(suggestions.length)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                <thead className="uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Pregunta sugerida</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td className="px-3 py-6" colSpan={5}>
                        <p className="text-center text-sm text-slate-500">
                          Cargando sugerencias…
                        </p>
                      </td>
                    </tr>
                  ) : recentSuggestions.length === 0 ? (
                    <tr>
                      <td className="px-3 py-6" colSpan={5}>
                        <p className="text-center text-sm text-slate-500">
                          No hay sugerencias registradas.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentSuggestions.map((suggestion) => {
                      const isDeleting = deletingSuggestionIds.has(suggestion.id)
                      const isPending = suggestion.status === 'pending'
                      return (
                        <tr key={suggestion.id}>
                          <td className="px-3 py-3 text-slate-100">
                            {suggestion.text}
                          </td>
                          <td className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {suggestion.category ?? '—'}
                          </td>
                          <td className="px-3 py-3 text-xs uppercase tracking-[0.2em]">
                            <span
                              className={
                                suggestion.status === 'approved'
                                  ? 'text-emerald-400'
                                  : suggestion.status === 'rejected'
                                    ? 'text-red-400'
                                    : 'text-amber-300'
                              }
                            >
                              {suggestion.status === 'approved'
                                ? 'Aprobada'
                                : suggestion.status === 'rejected'
                                  ? 'Rechazada'
                                  : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-400">
                            {dateFormatter.format(new Date(suggestion.createdAt))}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteSuggestion(suggestion.id)}
                              className="rounded-full border border-red-500/60 px-3 py-1 text-xs font-pixel uppercase tracking-[0.3em] text-red-300 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isDeleting || !isPending}
                            >
                              {isDeleting ? 'Eliminando…' : 'Eliminar'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Top preguntas
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              {metrics && metrics.topQuestions.length > 0 ? (
                metrics.topQuestions.map((question) => (
                  <li key={question.id} className="flex items-start justify-between gap-4">
                    <span className="flex-1 leading-tight">
                      {question.text}
                      <span className="ml-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                        — {numberFormatter.format(question.clickCount)}
                      </span>
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">Sin datos disponibles.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Clicks por categoría
            </h2>
            {metrics && clicksByCategoryEntries.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-300">
                {clicksByCategoryEntries.map(([category, total]) => (
                  <li key={category} className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.2em] text-slate-400">
                      {category}
                    </span>
                    <span className="font-semibold text-highlight">
                      {numberFormatter.format(total)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No hay registros aún.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
