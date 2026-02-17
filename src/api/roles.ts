import { apiClient } from './client'
import type { RolesResponse } from '../types/api'

export async function getRoles(): Promise<RolesResponse> {
  const { data } = await apiClient.get<RolesResponse>('/roles')
  return data
}
