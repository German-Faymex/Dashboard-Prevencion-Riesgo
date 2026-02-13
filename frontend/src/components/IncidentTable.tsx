import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Incident, Filters } from '../types'
import { fetchIncidents } from '../api/client'

interface IncidentTableProps {
  filters: Filters
}

function formatPesos(value: number): string {
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(value))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy')
  } catch {
    return dateStr
  }
}

function statusColor(status: string | null): string {
  if (!status) return 'text-gray-400'
  const upper = status.toUpperCase()
  if (upper === 'CONCLUIDO') return 'text-green-400 bg-green-500/10 border-green-500/30'
  if (upper === 'EN PROCESO') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  if (upper === 'NO REALIZADO') return 'text-red-400 bg-red-500/10 border-red-500/30'
  return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
}

type SortOrder = 'asc' | 'desc'

const COLUMNS = [
  { key: 'number', label: '#', width: 'w-12' },
  { key: 'name', label: 'Nombre', width: 'w-40' },
  { key: 'rut', label: 'RUT', width: 'w-28' },
  { key: 'position', label: 'Cargo', width: 'w-28' },
  { key: 'work_center', label: 'Centro', width: 'w-20' },
  { key: 'incident_type', label: 'Tipo', width: 'w-24' },
  { key: 'classifier', label: 'Tipificador', width: 'w-28' },
  { key: 'body_part', label: 'Parte del Cuerpo', width: 'w-32' },
  { key: 'date', label: 'Fecha', width: 'w-24' },
  { key: 'total_cost', label: 'Costo Total', width: 'w-28' },
  { key: 'final_status', label: 'Estado Final', width: 'w-28' },
]

export default function IncidentTable({ filters }: IncidentTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('number')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await fetchIncidents(filters, page, pageSize, search || undefined, sortBy, sortOrder)
      setIncidents(resp.items)
      setTotal(resp.total)
      setPages(resp.pages)
    } catch {
      console.error('Error al cargar incidentes')
    } finally {
      setLoading(false)
    }
  }, [filters, page, search, sortBy, sortOrder])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [search, filters])

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors ${col.width}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-3">
                      <div className="h-4 bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-8 text-center text-gray-500">
                  No se encontraron incidentes
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-750/50 transition-colors">
                  <td className="px-3 py-2.5 text-gray-400">{inc.number}</td>
                  <td className="px-3 py-2.5 text-gray-200 font-medium">{inc.name}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.rut}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.position || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.work_center || '-'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      inc.incident_type === 'ACCIDENTE'
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-orange-400 bg-orange-500/10'
                    }`}>
                      {inc.incident_type || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.classifier || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.body_part || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{formatDate(inc.date)}</td>
                  <td className="px-3 py-2.5 text-gray-200">{formatPesos(inc.total_cost)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(inc.final_status)}`}>
                      {inc.final_status || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Mostrando {incidents.length} de {total} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400">
            Página {page} de {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
