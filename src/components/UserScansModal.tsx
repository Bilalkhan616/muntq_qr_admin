import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useState } from 'react'
import { getScans } from '../api/logs'
import type { UserWithScans } from '../types/api'

const PAGE_SIZE = 20

interface UserScansModalProps {
  user: UserWithScans
  onClose: () => void
}

export function UserScansModal({ user, onClose }: UserScansModalProps) {
  const [statusFilter, setStatusFilter] = useState<'success' | 'failed' | ''>('')
  const [offset, setOffset] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['logs', 'scans', user.id, statusFilter || undefined, offset],
    queryFn: () =>
      getScans({
        userId: user.id,
        ...(statusFilter && { status: statusFilter }),
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: !!user.id,
  })

  const logs = data?.logs ?? []
  const pagination = data?.pagination ?? { total: 0, limit: PAGE_SIZE, offset: 0 }
  const totalPages = Math.ceil(pagination.total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              Scan logs — {user.firstName} {user.lastName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Status:
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'success' | 'failed' | '')
                  setOffset(0)
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              Failed to load scan logs.
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No scan logs found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Delivery No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Document Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        SAP Message
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {log.deliveryNo}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                          {log.documentType}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              log.status === 'success'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600" title={log.sapMessage}>
                          {log.sapMessage || '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.total > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500">
                    Showing {offset + 1}–
                    {Math.min(offset + PAGE_SIZE, pagination.total)} of {pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                      disabled={offset === 0}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffset((o) => o + PAGE_SIZE)}
                      disabled={currentPage >= totalPages}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
