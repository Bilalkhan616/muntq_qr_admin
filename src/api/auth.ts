import { apiClient, clearStoredToken, setStoredToken } from './client'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdateProfileRequest,
  AdminUpdateProfileRequest,
  AdminResetPasswordRequest,
  UserProfileResponse,
} from '../types/api'

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

export async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/auth/update-profile', payload)
  return data
}

export async function adminUpdateProfile(
  payload: AdminUpdateProfileRequest
): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<UserProfileResponse>('/auth/admin/update-profile', payload)
  return data
}

export async function adminResetPassword(
  payload: AdminResetPasswordRequest
): Promise<UserProfileResponse> {
  const { data } = await apiClient.post<UserProfileResponse>(
    '/auth/admin/reset-password',
    payload
  )
  return data
}
