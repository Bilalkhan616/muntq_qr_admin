import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsersWithScans } from '../api/logs'
import { EditUserModal } from '../components/EditUserModal'
import { ResetPasswordModal } from '../components/ResetPasswordModal'
import { MoreHorizontal, Pencil, KeyRound } from 'lucide-react'
import type { UserWithScans } from '../types/api'

function UserActionPopover({
  open,
  anchorRef,
  children,
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLButtonElement | null>
  children: React.ReactNode
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 4,
      left: rect.right - 160,
    })
  }, [open, anchorRef])

  if (!open) return null

  return createPortal(
    <div
      data-user-popover
      className="fixed z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body
  )
}

function UserActionsCell({
  user,
  onEditProfile,
  onResetPassword,
}: {
  user: UserWithScans
  onEditProfile: (user: UserWithScans) => void
  onResetPassword: (user: UserWithScans) => void
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !document.querySelector('[data-user-popover]')?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <UserActionPopover open={open} anchorRef={buttonRef}>
        {/* <button
          type="button"
          onClick={() => {
            setOpen(false)
            onEditProfile(user)
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </button> */}
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onResetPassword(user)
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
        >
          <KeyRound className="h-4 w-4" />
          Reset password
        </button>
      </UserActionPopover>
    </div>
  )
}

export function Users() {
  const [userToEdit, setUserToEdit] = useState<UserWithScans | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<UserWithScans | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['logs', 'users-with-scans'],
    queryFn: () => getUsersWithScans(),
    refetchOnMount: 'always',
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
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
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Failed to load users. The API may not be available.
        </div>
      </div>
    )
  }

  const users = data?.users ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Manage user accounts</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No users found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{user.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <UserActionsCell
                      user={user}
                      onEditProfile={setUserToEdit}
                      onResetPassword={setUserToResetPassword}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['logs', 'users-with-scans'] })}
        />
      )}
      {userToResetPassword && (
        <ResetPasswordModal
          user={userToResetPassword}
          onClose={() => setUserToResetPassword(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['logs', 'users-with-scans'] })}
        />
      )}
    </div>
  )
}
