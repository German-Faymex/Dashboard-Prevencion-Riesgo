import axios from 'axios'
import type {
  KPIs,
  ChartsData,
  BodyMapData,
  TrendsData,
  IncidentListResponse,
  UploadItem,
  UploadResponse,
  Filters,
} from '../types'

const api = axios.create({
  baseURL: '/api',
})

function buildParams(filters: Filters): Record<string, string> {
  const params: Record<string, string> = {}
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to
  if (filters.work_center) params.work_center = filters.work_center
  if (filters.position) params.position = filters.position
  if (filters.incident_type) params.incident_type = filters.incident_type
  if (filters.classifier) params.classifier = filters.classifier
  if (filters.body_part) params.body_part = filters.body_part
  if (filters.final_status) params.final_status = filters.final_status
  return params
}

export async function fetchKPIs(filters: Filters): Promise<KPIs> {
  const { data } = await api.get('/kpis', { params: buildParams(filters) })
  return data
}

export async function fetchCharts(filters: Filters): Promise<ChartsData> {
  const { data } = await api.get('/charts', { params: buildParams(filters) })
  return data
}

export async function fetchBodyMap(filters: Filters): Promise<BodyMapData> {
  const { data } = await api.get('/body-map', { params: buildParams(filters) })
  return data
}

export async function fetchTrends(filters: Filters): Promise<TrendsData> {
  const { data } = await api.get('/trends', { params: buildParams(filters) })
  return data
}

export async function fetchIncidents(
  filters: Filters,
  page: number = 1,
  size: number = 20,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<IncidentListResponse> {
  const params: Record<string, string | number> = {
    ...buildParams(filters),
    page,
    size,
  }
  if (search) params.search = search
  if (sortBy) params.sort_by = sortBy
  if (sortOrder) params.sort_order = sortOrder
  const { data } = await api.get('/incidents', { params })
  return data
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function fetchUploads(): Promise<UploadItem[]> {
  const { data } = await api.get('/uploads')
  return data
}

export async function deleteUpload(id: number): Promise<void> {
  await api.delete(`/uploads/${id}`)
}

export async function exportExcel(filters: Filters): Promise<void> {
  const response = await api.get('/export/excel', {
    params: buildParams(filters),
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'incidentes.xlsx')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
