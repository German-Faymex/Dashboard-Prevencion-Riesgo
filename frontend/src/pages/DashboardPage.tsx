import { useDashboard } from '../hooks/useDashboard'
import FilterBar from '../components/FilterBar'
import KPICards from '../components/KPICards'
import Charts from '../components/Charts'
import BodyMap from '../components/BodyMap'
import AlertsPanel from '../components/AlertsPanel'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { kpis, charts, bodyMap, trends, filters, setFilters, loading, error } = useDashboard()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard de Prevención</h1>
          <p className="text-sm text-gray-500 mt-1">Monitoreo de incidentes y accidentes laborales</p>
        </div>
        {loading && <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
          Error al cargar datos: {error}
        </div>
      )}

      <div id="dashboard-content">
        <KPICards kpis={kpis} />
        <Charts data={charts} section="top" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <BodyMap data={bodyMap} />
          <AlertsPanel data={trends} />
        </div>

        <Charts data={charts} section="bottom" />
      </div>
    </div>
  )
}
