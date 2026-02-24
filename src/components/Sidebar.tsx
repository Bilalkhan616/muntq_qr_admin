import { NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Home, UserPlus, Users, ScrollText, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import logoImg from '../assets/mataq.png'
import { Can } from '../lib/ability'
import { useAuthStore } from '../store/authStore'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home', subject: 'Dashboard' as const },
    { to: '/dashboard/register', icon: UserPlus, label: 'Register', subject: 'User' as const },
    { to: '/dashboard/users', icon: Users, label: 'Users', subject: 'User' as const },
    { to: '/dashboard/logs', icon: ScrollText, label: 'Logs', subject: 'Logs' as const },
  ]

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex h-16 items-center border-b border-slate-100 px-3 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <img
            src={logoImg}
            alt="Logo"
            className={`h-8 w-auto shrink-0 transition-all duration-300 ${
              collapsed ? 'hidden' : 'block'
            }`}
          />
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
            className="flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, icon: Icon, label, subject }) => {
            const action = to === '/dashboard/register' ? 'create' : 'read'
            return (
              <Can key={to} I={action} a={subject}>
                <NavLink
                  to={to}
                  end={to === '/dashboard'}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center overflow-hidden text-sm font-medium transition-all duration-300 ${
                      collapsed ? 'justify-center gap-0 rounded-xl p-3' : 'gap-3 rounded-xl px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </NavLink>
              </Can>
            )
          })}
        </nav>

        <div className={`border-t border-slate-100 p-4 ${collapsed ? 'px-2' : ''}`}>
          <div
            className={`truncate px-4 text-xs text-slate-500 transition-all duration-300 ${
              collapsed ? 'mb-0 h-0 overflow-hidden px-0 opacity-0' : 'mb-2 opacity-100'
            }`}
          >
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center overflow-hidden text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-red-50 hover:text-red-600 ${
              collapsed ? 'justify-center gap-0 rounded-xl p-3' : 'gap-3 rounded-xl px-4 py-3'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
