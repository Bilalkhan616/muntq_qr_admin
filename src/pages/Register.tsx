import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { register as apiRegister } from '../api/auth'
import { getRoles } from '../api/roles'
import type { Role } from '../types/api'

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response
    return res?.data?.message ?? 'Registration failed'
  }
  return err instanceof Error ? err.message : 'Registration failed'
}

function isSuperAdmin(role: Role): boolean {
  const key = (role.key ?? role.name ?? '').toLowerCase()
  return key === 'superadmin' || key === 'super_admin'
}

export function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })

  const roles = rolesData?.roles.filter((r) => !isSuperAdmin(r)) ?? []
  const defaultRoleId = roles[0]?.id ?? ''
  const selectedRoleId = roleId !== '' ? roleId : defaultRoleId

  const registerMutation = useMutation({
    mutationFn: () => {
      const id = typeof selectedRoleId === 'number' ? selectedRoleId : roles[0]?.id
      if (id == null) throw new Error('No role selected')
      return apiRegister({ firstName, lastName, email, password, roleId: id })
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'Account created successfully')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setRoleId('')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate()
  }

  const error = registerMutation.isError ? getErrorMessage(registerMutation.error) : null
  const isLoading = registerMutation.isPending

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register</h1>
        <p className="mt-1 text-slate-500">Create a new user account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              value={selectedRoleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              disabled={roles.length === 0}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50"
            >
              {roles.length === 0 && <option value="">Loading roles...</option>}
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={isLoading || roles.length === 0 || !selectedRoleId}
            className="rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  )
}
