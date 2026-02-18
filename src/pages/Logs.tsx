import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsersWithScans } from '../api/logs'
import { UserScansModal } from '../components/UserScansModal'
import type { UserWithScans } from '../types/api'

export function Logs() {
  const [selectedUser, setSelectedUser] = useState<UserWithScans | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['logs', 'users-with-scans'],
    queryFn: () => getUsersWithScans(),
    refetchOnMount: 'always',
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Logs</h1>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Logs</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Failed to load logs. The API may not be available.
        </div>
      </div>
    )
  }

  const users = data?.users ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Logs</h1>
          <p className="mt-1 text-slate-500">Users with scan statistics</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No users with scans found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Success
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Failed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr
                  key={user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedUser(user)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedUser(user)
                    }
                  }}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                    {user.totalDocuments}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-emerald-600">
                    {user.successCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-red-600">
                    {user.failedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <UserScansModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}
