export interface KPIs {
  total_incidents: number
  total_accidents: number
  total_lost_days: number
  total_cost: number
  active_cases: number
  avg_age: number
  incidents_this_month: number
  incidents_prev_month: number
  cost_this_month: number
  cost_prev_month: number
}

export interface ChartDataItem {
  name: string
  count?: number
  total_cost?: number
}

export interface MonthlyDataItem {
  month: string
  year: number
  incidents: number
  accidents: number
  cost: number
}

export interface ChartsData {
  by_type: ChartDataItem[]
  by_classifier: ChartDataItem[]
  by_work_center: ChartDataItem[]
  by_position: ChartDataItem[]
  by_month: MonthlyDataItem[]
  by_sex: ChartDataItem[]
  by_attention: ChartDataItem[]
  cost_by_classifier: ChartDataItem[]
}

export interface BodyPartData {
  name: string
  count: number
  percentage: number
  incidents: { id: number; name: string; date: string; classifier: string }[]
}

export interface BodyMapData {
  parts: BodyPartData[]
}

export interface AlertItem {
  type: string
  message: string
  severity: 'info' | 'warning' | 'danger'
}

export interface TrendsData {
  month_over_month_change: number
  cost_trend: number
  most_affected_body_part: { name: string; count: number }
  most_common_classifier: { name: string; count: number }
  alerts: AlertItem[]
}

export interface Incident {
  id: number
  number: number
  name: string
  rut: string
  age: number | null
  position: string | null
  work_center: string | null
  attention_type: string | null
  time_type: string | null
  lost_days: number
  sex: string | null
  incident_type: string | null
  classifier: string | null
  body_part: string | null
  observation: string | null
  date: string | null
  year: number | null
  attention_cost: number
  medicine_cost: number
  days_not_worked: number
  cost_per_day_not_worked: number
  total_cost: number
  status: string | null
  final_status: string | null
  image_url: string | null
  upload_id: number
}

export interface IncidentListResponse {
  items: Incident[]
  total: number
  page: number
  size: number
  pages: number
}

export interface UploadItem {
  id: number
  filename: string
  uploaded_at: string
  record_count: number
}

export interface UploadResponse {
  upload_id: number
  filename: string
  records_added: number
  total_records: number
}

export interface Filters {
  date_from?: string
  date_to?: string
  work_center?: string
  position?: string
  incident_type?: string
  classifier?: string
  body_part?: string
  final_status?: string
}
