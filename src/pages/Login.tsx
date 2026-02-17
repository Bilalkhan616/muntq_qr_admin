import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { login as apiLogin } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { HexGridBackground } from '../components/HexGridBackground'
import logoImg from '../assets/mataq.png'

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string }; status?: number } }).response
    return res?.data?.message ?? (res?.status === 401 ? 'Invalid credentials' : 'Login failed')
  }
  return err instanceof Error ? err.message : 'Login failed'
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const loginMutation = useMutation({
    mutationFn: () => apiLogin({ email, password }),
    onSuccess: (data) => {
      toast.success(data.message ?? 'Signed in successfully')
      setAuth(data)
      navigate(from, { replace: true })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  const error = loginMutation.isError ? getErrorMessage(loginMutation.error) : null
  const isLoading = loginMutation.isPending

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-y-auto py-8 px-4">
      <HexGridBackground />
      <div className="relative z-10 w-full max-w-md shrink-0">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-6 text-center">
            <img
              src={logoImg}
              alt="Logo"
              className="mx-auto h-12 w-auto"
            />
            {/* <p className="mt-2 text-sm text-slate-500">Sign in to your account</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

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
                autoComplete="email"
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder='********'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-accent-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
