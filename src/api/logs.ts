import { apiClient } from './client'
import type {
  GetScansParams,
  LogsResponse,
  ScanLogsResponse,
  UsersWithScansResponse,
} from '../types/api'

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

export async function getScans(params: GetScansParams): Promise<ScanLogsResponse> {
  const { data } = await apiClient.get<ScanLogsResponse>('/logs/scans', { params })
  return data
}
