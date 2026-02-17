import { apiClient } from './client'
import type { DashboardStats, KpiResponse } from '../types/api'

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
  return data
}

export async function getKpiUsers(): Promise<KpiResponse> {
  const { data } = await apiClient.get<KpiResponse>('/kpi/users')
  return data
}

export async function getKpiSuccessfulDocuments(): Promise<KpiResponse> {
  const { data } = await apiClient.get<KpiResponse>('/kpi/successful-documents')
  return data
}
