import { FileDown, FileText, X } from 'lucide-react'
import type { Filters } from '../types'
import { exportExcel } from '../api/client'

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const WORK_CENTERS = ['DET', 'DCH', 'AN', 'GEME', 'DMH', 'DSAL', 'CYD', 'ANGLO', 'SOCYBER', 'CASA CENTRAL']
const TYPES = ['ACCIDENTE', 'INCIDENTE']
const CLASSIFIERS = ['DERMATITIS', 'LESION', 'FATIGA MUSCULAR', 'INTOXICACIÓN', 'OTROS']
const FINAL_STATUSES = ['CONCLUIDO', 'EN PROCESO', 'NO REALIZADO']

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    onChange(newFilters)
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const handleExportPDF = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    try {
      await exportExcel(filters)
    } catch {
      console.error('Error al exportar Excel')
    }
  }

  const selectClasses =
    'bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 focus:outline-none transition-colors cursor-pointer'

  const dateClasses =
    'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 focus:outline-none transition-colors'

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 mb-6">
      <div className="flex flex-wrap items-end gap-3">
        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Desde</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => update('date_from', e.target.value)}
            className={dateClasses}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Hasta</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => update('date_to', e.target.value)}
            className={dateClasses}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Centro</label>
          <select
            value={filters.work_center || ''}
            onChange={(e) => update('work_center', e.target.value)}
            className={selectClasses}
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Todos</option>
            {WORK_CENTERS.map((wc) => (
              <option key={wc} value={wc}>{wc}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Tipo</label>
          <select
            value={filters.incident_type || ''}
            onChange={(e) => update('incident_type', e.target.value)}
            className={selectClasses}
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Todos</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Tipificador</label>
          <select
            value={filters.classifier || ''}
            onChange={(e) => update('classifier', e.target.value)}
            className={selectClasses}
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Todos</option>
            {CLASSIFIERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Estado</label>
          <select
            value={filters.final_status || ''}
            onChange={(e) => update('final_status', e.target.value)}
            className={selectClasses}
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Todos</option>
            {FINAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export buttons */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-600/30 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Exportar Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Debug: Active filters indicator */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-500">Filtros activos:</span>
          {Object.entries(filters).map(([key, value]) =>
            value ? (
              <span key={key} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                {key}: {value}
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
