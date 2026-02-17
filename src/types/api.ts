export interface Permission {
  key: string
  mainTag: string
  subTag: string
}

export interface User {
  id: number
  email: string
  role: string
}

export interface AuthResponse {
  success: boolean
  status: number
  message: string
  token: string
  user: User
  permissions?: Permission[]
}

export interface AuthErrorResponse {
  success: false
  status: number
  message: string
  errorCode?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  roleId: number
}

export interface DashboardStats {
  totalUsers?: number
  totalLogs?: number
  recentActivity?: Array<{ id: string; message: string; timestamp: string }>
}

export interface KpiResponse {
  success: boolean
  status: number
  message: string
  count: number
}

export interface LogEntry {
  id: string
  message: string
  timestamp: string
  level?: string
  [key: string]: unknown
}

export interface LogsResponse {
  logs: LogEntry[]
  total: number
}

export interface Role {
  id: number
  name: string
  key?: string
  [key: string]: unknown
}

export interface RolesResponse {
  roles: Role[]
}

export interface UserWithScans {
  id: number
  firstName: string
  lastName: string
  email: string
  totalDocuments: number
  successCount: number
  failedCount: number
}

export interface UsersWithScansResponse {
  success: boolean
  message: string
  users: UserWithScans[]
}
