import { apiClient } from './client'
import type { LogsResponse, UsersWithScansResponse } from '../types/api'

export interface GetLogsParams {
  page?: number
  limit?: number
  search?: string
}

export async function getLogs(params?: GetLogsParams): Promise<LogsResponse> {
  const { data } = await apiClient.get<LogsResponse>('/logs', { params })
  return data
}

export async function getUsersWithScans(): Promise<UsersWithScansResponse> {
  const { data } = await apiClient.get<UsersWithScansResponse>('/logs/users-with-scans')
  return data
}
