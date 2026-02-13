import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fetchUploads, deleteUpload } from '../api/client'
import UploadModal from '../components/UploadModal'
import type { UploadItem } from '../types'

export default function UploadsPage() {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadUploads = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUploads()
      setUploads(data)
    } catch {
      console.error('Error al cargar uploads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUploads()
  }, [loadUploads])

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Estás seguro de eliminar esta carga? Se eliminarán todos los registros asociados.')
    if (!confirmed) return

    setDeletingId(id)
    try {
      await deleteUpload(id)
      setUploads((prev) => prev.filter((u) => u.id !== id))
    } catch {
      console.error('Error al eliminar upload')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')
    } catch {
      return dateStr
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Cargas de Archivos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de archivos cargados al sistema</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Cargar Archivo
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No hay archivos cargados</p>
            <p className="text-sm text-gray-600 mt-1">Sube un archivo Excel o CSV para comenzar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Archivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha de Carga
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {uploads.map((upload) => (
                <tr key={upload.id} className="hover:bg-gray-750/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-green-400" />
                      <span className="text-gray-200 font-medium">{upload.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(upload.uploaded_at)}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-200 font-medium">{upload.record_count}</span>
                    <span className="text-gray-500 ml-1">registros</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(upload.id)}
                      disabled={deletingId === upload.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deletingId === upload.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {
          loadUploads()
        }}
      />
    </div>
  )
}
