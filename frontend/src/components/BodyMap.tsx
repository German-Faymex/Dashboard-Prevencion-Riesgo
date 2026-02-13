import { useState, useMemo } from 'react'
import type { BodyMapData, BodyPartData } from '../types'
import { X } from 'lucide-react'

interface BodyMapProps {
  data: BodyMapData | null
}

interface BodyRegion {
  id: string
  label: string
  type: 'ellipse' | 'rect'
  cx?: number
  cy?: number
  rx?: number
  ry?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

const BODY_REGIONS: BodyRegion[] = [
  { id: 'cabeza', label: 'Cabeza', type: 'ellipse', cx: 150, cy: 45, rx: 35, ry: 40 },
  { id: 'cuello', label: 'Cuello', type: 'rect', x: 135, y: 85, width: 30, height: 25 },
  { id: 'hombro_izquierdo', label: 'Hombro Izquierdo', type: 'ellipse', cx: 95, cy: 120, rx: 20, ry: 12 },
  { id: 'hombro_derecho', label: 'Hombro Derecho', type: 'ellipse', cx: 205, cy: 120, rx: 20, ry: 12 },
  { id: 'pecho_izquierdo', label: 'Pecho Izquierdo', type: 'rect', x: 110, y: 130, width: 40, height: 40 },
  { id: 'pecho_derecho', label: 'Pecho Derecho', type: 'rect', x: 150, y: 130, width: 40, height: 40 },
  { id: 'brazo_izquierdo', label: 'Brazo Izquierdo', type: 'rect', x: 55, y: 135, width: 28, height: 60 },
  { id: 'brazo_derecho', label: 'Brazo Derecho', type: 'rect', x: 217, y: 135, width: 28, height: 60 },
  { id: 'intercostal_izquierdo', label: 'Intercostal Izquierdo', type: 'rect', x: 110, y: 170, width: 40, height: 30 },
  { id: 'intercostal_derecho', label: 'Intercostal Derecho', type: 'rect', x: 150, y: 170, width: 40, height: 30 },
  { id: 'abdomen', label: 'Abdomen', type: 'rect', x: 120, y: 200, width: 60, height: 40 },
  { id: 'antebrazo_izquierdo', label: 'Antebrazo Izquierdo', type: 'rect', x: 40, y: 200, width: 25, height: 65 },
  { id: 'antebrazo_derecho', label: 'Antebrazo Derecho', type: 'rect', x: 235, y: 200, width: 25, height: 65 },
  { id: 'mano_izquierda', label: 'Mano Izquierda', type: 'ellipse', cx: 40, cy: 280, rx: 15, ry: 18 },
  { id: 'mano_derecha', label: 'Mano Derecha', type: 'ellipse', cx: 260, cy: 280, rx: 15, ry: 18 },
  { id: 'cadera', label: 'Cadera', type: 'rect', x: 110, y: 240, width: 80, height: 25 },
  { id: 'muslo_izquierdo', label: 'Muslo Izquierdo', type: 'rect', x: 110, y: 270, width: 38, height: 75 },
  { id: 'muslo_derecho', label: 'Muslo Derecho', type: 'rect', x: 152, y: 270, width: 38, height: 75 },
  { id: 'rodilla_izquierda', label: 'Rodilla Izquierda', type: 'ellipse', cx: 129, cy: 355, rx: 16, ry: 15 },
  { id: 'rodilla_derecha', label: 'Rodilla Derecha', type: 'ellipse', cx: 171, cy: 355, rx: 16, ry: 15 },
  { id: 'pierna_izquierda', label: 'Pierna Izquierda', type: 'rect', x: 113, y: 375, width: 32, height: 70 },
  { id: 'pierna_derecha', label: 'Pierna Derecha', type: 'rect', x: 155, y: 375, width: 32, height: 70 },
  { id: 'tobillo_izquierdo', label: 'Tobillo Izquierdo', type: 'ellipse', cx: 129, cy: 455, rx: 14, ry: 10 },
  { id: 'tobillo_derecho', label: 'Tobillo Derecho', type: 'ellipse', cx: 171, cy: 455, rx: 14, ry: 10 },
  { id: 'pie_izquierdo', label: 'Pie Izquierdo', type: 'ellipse', cx: 125, cy: 480, rx: 18, ry: 14 },
  { id: 'pie_derecho', label: 'Pie Derecho', type: 'ellipse', cx: 175, cy: 480, rx: 18, ry: 14 },
  { id: 'espalda', label: 'Espalda', type: 'rect', x: 120, y: 135, width: 60, height: 45 },
  { id: 'gluteo', label: 'Glúteos', type: 'rect', x: 115, y: 248, width: 70, height: 20 },
]

function normalizeBodyPart(name: string): string {
  const normalized = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  const mappings: Record<string, string> = {
    'CABEZA': 'cabeza',
    'CRANEO': 'cabeza',
    'CARA': 'cabeza',
    'ROSTRO': 'cabeza',
    'FRENTE': 'cabeza',
    'CUELLO': 'cuello',
    'CERVICAL': 'cuello',
    'HOMBRO IZQUIERDO': 'hombro_izquierdo',
    'HOMBRO IZQ': 'hombro_izquierdo',
    'HOMBRO DERECHO': 'hombro_derecho',
    'HOMBRO DER': 'hombro_derecho',
    'HOMBRO': 'hombro_derecho',
    'PECHO': 'pecho_izquierdo',
    'PECTORAL IZQUIERDO': 'pecho_izquierdo',
    'PECHO IZQUIERDO': 'pecho_izquierdo',
    'PECTORAL DERECHO': 'pecho_derecho',
    'PECHO DERECHO': 'pecho_derecho',
    'TORAX': 'pecho_izquierdo',
    'BRAZO IZQUIERDO': 'brazo_izquierdo',
    'BRAZO POSTERIOR IZQUIERDO': 'brazo_izquierdo',
    'BRAZO ANTERIOR IZQUIERDO': 'brazo_izquierdo',
    'BRAZO IZQ': 'brazo_izquierdo',
    'BRAZO DERECHO': 'brazo_derecho',
    'BRAZO POSTERIOR DERECHO': 'brazo_derecho',
    'BRAZO ANTERIOR DERECHO': 'brazo_derecho',
    'BRAZO DER': 'brazo_derecho',
    'BRAZO': 'brazo_derecho',
    'INTERCOSTAL IZQUIERDO': 'intercostal_izquierdo',
    'INTERCOSTAL IZQ': 'intercostal_izquierdo',
    'INTERCOSTAL DERECHO': 'intercostal_derecho',
    'INTERCOSTAL DER': 'intercostal_derecho',
    'INTERCOSTAL': 'intercostal_derecho',
    'ABDOMEN': 'abdomen',
    'ABDOMINAL': 'abdomen',
    'ESTOMAGO': 'abdomen',
    'ANTEBRAZO IZQUIERDO': 'antebrazo_izquierdo',
    'ANTEBRAZO IZQ': 'antebrazo_izquierdo',
    'ANTEBRAZO DERECHO': 'antebrazo_derecho',
    'ANTEBRAZO DER': 'antebrazo_derecho',
    'ANTEBRAZO': 'antebrazo_derecho',
    'MUNECA IZQUIERDA': 'antebrazo_izquierdo',
    'MUNECA DERECHA': 'antebrazo_derecho',
    'MUNECA': 'antebrazo_derecho',
    'MANO IZQUIERDA': 'mano_izquierda',
    'MANO IZQ': 'mano_izquierda',
    'MANO DERECHA': 'mano_derecha',
    'MANO DER': 'mano_derecha',
    'MANO': 'mano_derecha',
    'DEDO': 'mano_derecha',
    'DEDOS': 'mano_derecha',
    'DEDO MANO DERECHA': 'mano_derecha',
    'DEDO MANO IZQUIERDA': 'mano_izquierda',
    'CADERA': 'cadera',
    'PELVIS': 'cadera',
    'INGLE': 'cadera',
    'MUSLO IZQUIERDO': 'muslo_izquierdo',
    'MUSLO IZQ': 'muslo_izquierdo',
    'MUSLO DERECHO': 'muslo_derecho',
    'MUSLO DER': 'muslo_derecho',
    'MUSLO': 'muslo_derecho',
    'PIERNA IZQUIERDA': 'pierna_izquierda',
    'PIERNA IZQ': 'pierna_izquierda',
    'PIERNA DERECHA': 'pierna_derecha',
    'PIERNA DER': 'pierna_derecha',
    'PIERNA': 'pierna_derecha',
    'RODILLA IZQUIERDA': 'rodilla_izquierda',
    'RODILLA IZQ': 'rodilla_izquierda',
    'RODILLA DERECHA': 'rodilla_derecha',
    'RODILLA DER': 'rodilla_derecha',
    'RODILLA': 'rodilla_derecha',
    'TOBILLO IZQUIERDO': 'tobillo_izquierdo',
    'TOBILLO IZQ': 'tobillo_izquierdo',
    'TOBILLO DERECHO': 'tobillo_derecho',
    'TOBILLO DER': 'tobillo_derecho',
    'TOBILLO': 'tobillo_derecho',
    'PIE IZQUIERDO': 'pie_izquierdo',
    'PIES IZQUIERDO': 'pie_izquierdo',
    'PIE IZQ': 'pie_izquierdo',
    'PIE DERECHO': 'pie_derecho',
    'PIES DERECHO': 'pie_derecho',
    'PIE DER': 'pie_derecho',
    'PIE': 'pie_derecho',
    'PIES': 'pie_derecho',
    'TALON IZQUIERDO': 'pie_izquierdo',
    'TALON DERECHO': 'pie_derecho',
    'TALON': 'pie_derecho',
    'ESPALDA': 'espalda',
    'ESPALDA ALTA': 'espalda',
    'ESPALDA BAJA': 'espalda',
    'LUMBAR': 'espalda',
    'DORSAL': 'espalda',
    'COLUMNA': 'espalda',
    'GLUTEO': 'gluteo',
    'GLUTEOS': 'gluteo',
    'GLUTEO DERECHO': 'gluteo',
    'GLUTEO IZQUIERDO': 'gluteo',
    'GLUTEO MEDIO DERECHO': 'gluteo',
    'GLUTEO MEDIO IZQUIERDO': 'gluteo',
  }

  // Direct match
  if (mappings[normalized]) return mappings[normalized]

  // Partial match
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key) || key.includes(normalized)) return value
  }

  return ''
}

function getColorByCount(count: number): string {
  if (count === 0) return '#374151'
  if (count === 1) return '#22c55e'
  if (count === 2) return '#eab308'
  if (count === 3) return '#f97316'
  return '#ef4444'
}

function getOpacityByCount(count: number): number {
  if (count === 0) return 0.4
  return 0.7
}

export default function BodyMap({ data }: BodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<BodyPartData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Build a mapping from region ID to body part data
  const regionData = useMemo(() => {
    const map: Record<string, { count: number; parts: BodyPartData[] }> = {}

    if (!data?.parts) return map

    for (const part of data.parts) {
      const regionId = normalizeBodyPart(part.name)
      if (!regionId) continue
      if (!map[regionId]) {
        map[regionId] = { count: 0, parts: [] }
      }
      map[regionId].count += part.count
      map[regionId].parts.push(part)
    }

    return map
  }, [data])

  const handleRegionClick = (regionId: string) => {
    const rd = regionData[regionId]
    if (rd && rd.parts.length > 0) {
      // Merge incidents from all matching parts
      const merged: BodyPartData = {
        name: BODY_REGIONS.find((r) => r.id === regionId)?.label || regionId,
        count: rd.count,
        percentage: rd.parts.reduce((acc, p) => acc + p.percentage, 0),
        incidents: rd.parts.flatMap((p) => p.incidents),
      }
      setSelectedPart(merged)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, regionId: string) => {
    setHoveredRegion(regionId)
    const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect()
    if (svgRect) {
      setTooltipPos({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top - 10,
      })
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Mapa Corporal de Incidentes</h3>
      <div className="flex gap-4">
        {/* SVG Body */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 300 510" width="240" height="408" className="mx-auto">
            {/* Body silhouette outline */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Body outline for visual reference */}
            <ellipse cx="150" cy="45" rx="38" ry="43" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="133" y="84" width="34" height="28" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <path
              d="M95 108 Q75 125 55 135 L83 135 L110 110 Z"
              fill="none" stroke="#4b5563" strokeWidth="1"
            />
            <path
              d="M205 108 Q225 125 245 135 L217 135 L190 110 Z"
              fill="none" stroke="#4b5563" strokeWidth="1"
            />
            <rect x="108" y="108" width="84" height="100" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="53" y="133" width="30" height="65" rx="8" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="217" y="133" width="30" height="65" rx="8" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="38" y="198" width="28" height="68" rx="6" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="234" y="198" width="28" height="68" rx="6" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="40" cy="280" rx="16" ry="19" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="260" cy="280" rx="16" ry="19" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="108" y="208" width="84" height="60" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="108" y="268" width="40" height="80" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="152" y="268" width="40" height="80" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="129" cy="355" rx="18" ry="17" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="171" cy="355" rx="18" ry="17" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="111" y="372" width="36" height="75" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <rect x="153" y="372" width="36" height="75" rx="5" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="129" cy="455" rx="15" ry="11" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="171" cy="455" rx="15" ry="11" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="125" cy="480" rx="20" ry="16" fill="none" stroke="#4b5563" strokeWidth="1" />
            <ellipse cx="175" cy="480" rx="20" ry="16" fill="none" stroke="#4b5563" strokeWidth="1" />

            {/* Interactive regions */}
            {BODY_REGIONS.map((region) => {
              const rd = regionData[region.id]
              const count = rd?.count || 0
              const fill = getColorByCount(count)
              const opacity = getOpacityByCount(count)
              const isHovered = hoveredRegion === region.id
              const isSelected = selectedPart?.name === region.label

              const commonProps = {
                fill,
                opacity: isHovered ? Math.min(opacity + 0.2, 1) : opacity,
                stroke: isSelected ? '#ffffff' : isHovered ? '#d1d5db' : 'transparent',
                strokeWidth: isSelected ? 2 : isHovered ? 1.5 : 0,
                cursor: 'pointer' as const,
                filter: count > 0 && isHovered ? 'url(#glow)' : undefined,
                onMouseMove: (e: React.MouseEvent<SVGElement>) => handleMouseMove(e, region.id),
                onMouseLeave: () => setHoveredRegion(null),
                onClick: () => handleRegionClick(region.id),
              }

              if (region.type === 'ellipse') {
                return (
                  <ellipse
                    key={region.id}
                    cx={region.cx}
                    cy={region.cy}
                    rx={region.rx}
                    ry={region.ry}
                    {...commonProps}
                  />
                )
              }

              return (
                <rect
                  key={region.id}
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  rx={4}
                  {...commonProps}
                />
              )
            })}
          </svg>

          {/* Tooltip */}
          {hoveredRegion && (
            <div
              className="absolute pointer-events-none bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-200 shadow-lg z-50"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <span className="font-medium">
                {BODY_REGIONS.find((r) => r.id === hoveredRegion)?.label}
              </span>
              <span className="ml-2 text-gray-400">
                {regionData[hoveredRegion]?.count || 0} incidentes
              </span>
            </div>
          )}

          {/* Color legend */}
          <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151' }} />0
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />1
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />2
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />3
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />4+
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 min-w-0">
          {selectedPart ? (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-200">{selectedPart.name}</h4>
                <button
                  onClick={() => setSelectedPart(null)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-4 mb-3">
                <div>
                  <p className="text-2xl font-bold text-orange-400">{selectedPart.count}</p>
                  <p className="text-xs text-gray-500">incidentes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{selectedPart.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">del total</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedPart.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-gray-800 rounded-lg p-2.5 border border-gray-700"
                  >
                    <p className="text-xs font-medium text-gray-200">{inc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">{inc.date}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
                        {inc.classifier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              <p>Selecciona una zona del cuerpo para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
