import axios from 'axios'

const tokenKey = 'auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(tokenKey)
}

export function clearStoredToken(): void {
  localStorage.removeItem(tokenKey)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(tokenKey, token)
}

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
