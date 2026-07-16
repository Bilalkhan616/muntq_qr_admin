import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getMobilePermissions,
  getMobileUsers,
  getUserPermissions,
  setUserPermissions,
} from '../api/auth'
import type { Permission } from '../types/api'

const MOBILE_PERMISSION_ORDER = [
  'mobile.pod.access',
  'mobile.supportingDocument.access',
  'mobile.trip.create',
  'mobile.trip.update',
] as const

const MOBILE_PERMISSION_LABELS: Record<(typeof MOBILE_PERMISSION_ORDER)[number], string> = {
  'mobile.pod.access': 'POD',
  'mobile.supportingDocument.access': 'Supporting Document',
  'mobile.trip.create': 'Trip Creation',
  'mobile.trip.update': 'Trip Update',
}

const EXCLUDED_USER_ROLES = new Set(['admin', 'superadmin'])

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response
    return res?.data?.message ?? 'Request failed'
  }
  return err instanceof Error ? err.message : 'Request failed'
}

function sortMobilePermissions(permissions: Permission[]): Permission[] {
  const byKey = new Map(permissions.map((p) => [p.key, p]))
  return MOBILE_PERMISSION_ORDER.map((key) => byKey.get(key)).filter(
    (p): p is Permission => p != null && p.id != null
  )
}

export function Roles() {
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [checkedIds, setCheckedIds] = useState<number[]>([])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['mobile-users'],
    queryFn: getMobileUsers,
  })

  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } =
    useQuery({
      queryKey: ['mobile-permissions'],
      queryFn: getMobilePermissions,
    })

  const {
    data: userPermissionsData,
    isLoading: userPermissionsLoading,
    isFetching: userPermissionsFetching,
    error: userPermissionsError,
  } = useQuery({
    queryKey: ['user-permissions', selectedUserId],
    queryFn: () => getUserPermissions(selectedUserId as number),
    enabled: selectedUserId !== '',
  })

  const mobilePermissions = useMemo(
    () => sortMobilePermissions(permissionsData?.permissions ?? []),
    [permissionsData]
  )

  const users = useMemo(
    () =>
      (usersData?.users ?? []).filter(
        (user) => !EXCLUDED_USER_ROLES.has(user.role.toLowerCase())
      ),
    [usersData]
  )

  useEffect(() => {
    if (!userPermissionsData) return
    setCheckedIds(userPermissionsData.permissions.map((p) => p.id!).filter(Boolean))
  }, [userPermissionsData])

  useEffect(() => {
    if (!userDropdownOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!userDropdownRef.current?.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserDropdownOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [userDropdownOpen])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (selectedUserId === '') throw new Error('No user selected')
      return setUserPermissions(selectedUserId, checkedIds)
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Permissions updated successfully')
      queryClient.invalidateQueries({ queryKey: ['user-permissions', selectedUserId] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  const togglePermission = (permissionId: number) => {
    setCheckedIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const isLoading = usersLoading || permissionsLoading
  const loadError = usersError ?? permissionsError
  const selectedUser = users.find((u) => u.id === selectedUserId)
  const permissionsBusy = userPermissionsLoading || userPermissionsFetching

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
        <div className="animate-pulse space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-10 rounded-lg bg-slate-200" />
          <div className="h-32 rounded-lg bg-slate-200" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Failed to load roles data. {getErrorMessage(loadError)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
        <p className="mt-1 text-slate-500">Assign mobile module permissions to users</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-slate-700">
              User
            </label>
            <div ref={userDropdownRef} className="relative mt-2">
              <button
                id="user"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={userDropdownOpen}
                onClick={() => setUserDropdownOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              >
                <span className={selectedUser ? 'text-slate-900' : 'text-slate-500'}>
                  {selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
                    : 'Select a user'}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {userDropdownOpen && (
                <ul
                  role="listbox"
                  aria-labelledby="user"
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-300 bg-white py-1 shadow-lg"
                >
                  {users.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-slate-500">No users found.</li>
                  ) : (
                    users.map((user) => {
                      const isSelected = user.id === selectedUserId
                      return (
                        <li key={user.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setCheckedIds([])
                              setUserDropdownOpen(false)
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                              isSelected
                                ? 'bg-accent-50 font-medium text-accent-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {user.firstName} {user.lastName} ({user.email})
                          </button>
                        </li>
                      )
                    })
                  )}
                </ul>
              )}
            </div>
            {users.length === 0 && !userDropdownOpen && (
              <p className="mt-2 text-sm text-slate-500">No users found.</p>
            )}
          </div>

          {selectedUserId !== '' && (
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Permissions</p>

              {userPermissionsError && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {getErrorMessage(userPermissionsError)}
                </div>
              )}

              {permissionsBusy ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {mobilePermissions.map((permission) => {
                    const label =
                      MOBILE_PERMISSION_LABELS[
                        permission.key as (typeof MOBILE_PERMISSION_ORDER)[number]
                      ] ?? permission.description ?? permission.key

                    return (
                      <label
                        key={permission.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checkedIds.includes(permission.id!)}
                          onChange={() => togglePermission(permission.id!)}
                          disabled={!selectedUser?.isActive}
                          className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500/20"
                        />
                        <span className="text-sm font-medium text-slate-900">{label}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {selectedUser && !selectedUser.isActive && (
                <p className="mt-3 text-sm text-amber-600">
                  This user is locked. Unlock them before changing permissions.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={
              selectedUserId === '' ||
              permissionsBusy ||
              saveMutation.isPending ||
              !selectedUser?.isActive ||
              !!userPermissionsError
            }
            className="rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save permissions'}
          </button>
        </div>
      </form>
    </div>
  )
}
