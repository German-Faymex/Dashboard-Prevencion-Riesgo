import { useState } from 'react'
import { Upload } from 'lucide-react'
import IncidentTable from '../components/IncidentTable'
import FilterBar from '../components/FilterBar'
import UploadModal from '../components/UploadModal'
import type { Filters } from '../types'

export default function IncidentsPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Incidentes</h1>
          <p className="text-sm text-gray-500 mt-1">Listado completo de incidentes y accidentes</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Cargar Archivo
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div key={refreshKey}>
        <IncidentTable filters={filters} />
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {
          setRefreshKey((k) => k + 1)
        }}
      />
    </div>
  )
}
