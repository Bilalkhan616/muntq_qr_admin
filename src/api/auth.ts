import { apiClient, clearStoredToken, setStoredToken } from './client'
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/api'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
  setStoredToken(data.token)
  return data
}

export async function register(formData: RegisterData): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', formData)
  return data
}

export function logout(): void {
  clearStoredToken()
}
