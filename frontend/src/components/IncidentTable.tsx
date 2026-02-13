import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Incident, Filters } from '../types'
import { fetchIncidents } from '../api/client'

interface IncidentTableProps {
  filters: Filters
}

function formatPesos(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(Math.round(value))
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
  if (!status) return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  const upper = status.toUpperCase()
  if (upper === 'CONCLUIDO') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (upper === 'EN PROCESO') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  if (upper === 'NO REALIZADO') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
}

function tipoColor(tipo: string | null): string {
  if (!tipo) return 'text-gray-400 bg-gray-500/10'
  const upper = tipo.toUpperCase()
  if (upper === 'ACCIDENTE') return 'bg-red-500/20 text-red-400'
  if (upper === 'INCIDENTE') return 'bg-orange-500/20 text-orange-400'
  return 'text-gray-400 bg-gray-500/10'
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

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    const maxVisible = 5

    if (pages <= maxVisible + 2) {
      for (let i = 1; i <= pages; i++) pageNumbers.push(i)
    } else {
      pageNumbers.push(1)
      if (page > 3) pageNumbers.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(pages - 1, page + 1)
      for (let i = start; i <= end; i++) pageNumbers.push(i)
      if (page < pages - 2) pageNumbers.push('...')
      pageNumbers.push(pages)
    }

    return pageNumbers
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl shadow-lg shadow-black/20 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/80 border-b-2 border-gray-600">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`sticky top-0 px-3 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200 transition-colors ${col.width}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <span className="inline-flex flex-col">
                      {sortBy === col.key ? (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-orange-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-orange-400" />
                        )
                      ) : (
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-800/30' : ''}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-3">
                      <div className="h-4 bg-gray-700/60 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-600" />
                    <span>No se encontraron incidentes</span>
                  </div>
                </td>
              </tr>
            ) : (
              incidents.map((inc, index) => (
                <tr
                  key={inc.id}
                  className={`hover:bg-gray-700/40 transition-colors duration-150 border-b border-gray-700/30 ${
                    index % 2 === 0 ? 'bg-gray-800/30' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-gray-500 font-mono text-xs">{inc.number}</td>
                  <td className="px-3 py-2.5 text-gray-200 font-medium">{inc.name}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono text-xs">{inc.rut}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.position || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.work_center || '-'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${tipoColor(inc.incident_type)}`}>
                      {inc.incident_type || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.classifier || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400">{inc.body_part || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-400 tabular-nums">{formatDate(inc.date)}</td>
                  <td className="px-3 py-2.5 text-gray-200 font-medium tabular-nums">{formatPesos(inc.total_cost)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${statusColor(inc.final_status)}`}>
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
      <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-700/50 bg-gray-800/30">
        <p className="text-gray-500 text-sm">
          Mostrando {incidents.length} de {total} registros
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((pageNum, i) =>
            typeof pageNum === 'string' ? (
              <span key={`dots-${i}`} className="px-2 text-gray-500 text-sm">
                {pageNum}
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
