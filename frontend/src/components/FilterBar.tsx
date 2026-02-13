import { FileDown, FileText, X } from 'lucide-react'
import type { Filters } from '../types'
import { exportExcel } from '../api/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
    onChange({ ...filters, [key]: value || undefined })
  }

  const clearFilters = () => {
    onChange({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#030712',
        scale: 2,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a3')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('dashboard-sst.pdf')
    } catch {
      console.error('Error al exportar PDF')
    }
  }

  const handleExportExcel = async () => {
    try {
      await exportExcel(filters)
    } catch {
      console.error('Error al exportar Excel')
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Desde</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => update('date_from', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Hasta</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => update('date_to', e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Dropdowns */}
        <select
          value={filters.work_center || ''}
          onChange={(e) => update('work_center', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
        >
          <option value="">Centro de Trabajo</option>
          {WORK_CENTERS.map((wc) => (
            <option key={wc} value={wc}>{wc}</option>
          ))}
        </select>

        <select
          value={filters.incident_type || ''}
          onChange={(e) => update('incident_type', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
        >
          <option value="">Tipo</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.classifier || ''}
          onChange={(e) => update('classifier', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
        >
          <option value="">Tipificador</option>
          {CLASSIFIERS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.final_status || ''}
          onChange={(e) => update('final_status', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
        >
          <option value="">Estado Final</option>
          {FINAL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export buttons */}
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Exportar Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-1.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
    </div>
  )
}
