import { useMutation } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { adminLockUser, adminUnlockUser } from '../api/auth'
import type { UserWithScans } from '../types/api'

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response
    return res?.data?.message ?? 'Something went wrong'
  }
  return err instanceof Error ? err.message : 'Something went wrong'
}

export type LockConfirmMode = 'lock' | 'unlock'

interface LockUserConfirmModalProps {
  user: UserWithScans
  mode: LockConfirmMode
  onClose: () => void
  onSuccess?: () => void
}

export function LockUserConfirmModal({ user, mode, onClose, onSuccess }: LockUserConfirmModalProps) {
  const isLock = mode === 'lock'

  const mutation = useMutation({
    mutationFn: () => (isLock ? adminLockUser(user.id) : adminUnlockUser(user.id)),
    onSuccess: () => {
      toast.success(isLock ? 'User locked' : 'User unlocked')
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-user-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="lock-user-title" className="text-lg font-semibold text-slate-900">
            {isLock ? 'Lock user' : 'Unlock user'}
          </h2>
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
          <p className="text-sm text-slate-600">
            {isLock ? (
              <>
                Lock <span className="font-medium text-slate-900">{user.firstName} {user.lastName}</span> (
                {user.email})? They will not be able to sign in until an admin unlocks the account.
              </>
            ) : (
              <>
                Unlock <span className="font-medium text-slate-900">{user.firstName} {user.lastName}</span> (
                {user.email})? They will be able to sign in again.
              </>
            )}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className={
                isLock
                  ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'
                  : 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50'
              }
            >
              {mutation.isPending ? (isLock ? 'Locking…' : 'Unlocking…') : isLock ? 'Lock user' : 'Unlock user'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
