import { useState, useEffect, useCallback } from 'react'
import type { KPIs, ChartsData, BodyMapData, TrendsData, Filters } from '../types'
import { fetchKPIs, fetchCharts, fetchBodyMap, fetchTrends } from '../api/client'

interface DashboardState {
  kpis: KPIs | null
  charts: ChartsData | null
  bodyMap: BodyMapData | null
  trends: TrendsData | null
  filters: Filters
  setFilters: (filters: Filters) => void
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboard(): DashboardState {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [charts, setCharts] = useState<ChartsData | null>(null)
  const [bodyMap, setBodyMap] = useState<BodyMapData | null>(null)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [kpisData, chartsData, bodyMapData, trendsData] = await Promise.all([
        fetchKPIs(filters),
        fetchCharts(filters),
        fetchBodyMap(filters),
        fetchTrends(filters),
      ])
      setKpis(kpisData)
      setCharts(chartsData)
      setBodyMap(bodyMapData)
      setTrends(trendsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    kpis,
    charts,
    bodyMap,
    trends,
    filters,
    setFilters,
    loading,
    error,
    refresh: loadData,
  }
}
