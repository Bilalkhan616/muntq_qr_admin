import { useQuery } from '@tanstack/react-query'
import {
  getKpiUsers,
  getKpiSuccessfulDocuments,
} from '../api/dashboard'

export function Home() {
  const usersQuery = useQuery({
    queryKey: ['kpi', 'users'],
    queryFn: getKpiUsers,
  })
  const documentsQuery = useQuery({
    queryKey: ['kpi', 'successful-documents'],
    queryFn: getKpiSuccessfulDocuments,
  })

  const isLoading = usersQuery.isLoading || documentsQuery.isLoading
  const error = usersQuery.error ?? documentsQuery.error

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Failed to load KPI data. The API may not be available.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Welcome back. Here's an overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {usersQuery.data?.count ?? '—'}
          </p>
          {usersQuery.data?.message && (
            <p className="mt-1 text-xs text-slate-400">
              {usersQuery.data.message}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Successful Documents
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {documentsQuery.data?.count ?? '—'}
          </p>
          {documentsQuery.data?.message && (
            <p className="mt-1 text-xs text-slate-400">
              {documentsQuery.data.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
