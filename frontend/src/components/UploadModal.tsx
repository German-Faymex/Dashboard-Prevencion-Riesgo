import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadFile } from '../api/client'
import type { UploadResponse } from '../types'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setFile(null)
    setResult(null)
    setError(null)
    setDragOver(false)
  }, [])

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const resp = await uploadFile(file)
      setResult(resp)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el archivo')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Cargar Archivo</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          /* Success state */
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-200 font-medium mb-1">Archivo cargado exitosamente</p>
            <p className="text-sm text-gray-400 mb-1">{result.filename}</p>
            <p className="text-sm text-gray-400">
              {result.records_added} registros agregados de {result.total_records} totales
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-orange-500 bg-orange-500/5'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-200 font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-300 mb-1">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500">Formatos: .xlsx, .xls, .csv</p>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Cargando...' : 'Subir Archivo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
