import { useState, useMemo, useRef } from 'react'
import type { BodyMapData, BodyPartData } from '../types'
import { X } from 'lucide-react'

interface BodyMapProps {
  data: BodyMapData | null
}

interface BodyRegion {
  id: string
  label: string
  path: string
}

// ---- SVG path-based body regions (viewBox 0 0 200 450) ----
const BODY_REGIONS: BodyRegion[] = [
  // HEAD & NECK
  {
    id: 'cabeza',
    label: 'Cabeza',
    path: 'M100,8 C120,8 136,20 138,40 C139,52 132,62 124,66 C118,69 112,70 100,70 C88,70 82,69 76,66 C68,62 61,52 62,40 C64,20 80,8 100,8 Z',
  },
  {
    id: 'cuello',
    label: 'Cuello',
    path: 'M90,70 C93,70 97,71 100,71 C103,71 107,70 110,70 L112,78 C112,82 108,86 100,86 C92,86 88,82 88,78 Z',
  },
  // TORSO - Shoulders
  {
    id: 'hombro_izquierdo',
    label: 'Hombro Izquierdo',
    path: 'M72,86 L88,86 C88,86 86,92 82,96 L66,100 C60,100 58,96 60,92 C62,88 67,86 72,86 Z',
  },
  {
    id: 'hombro_derecho',
    label: 'Hombro Derecho',
    path: 'M112,86 L128,86 C133,86 138,88 140,92 C142,96 140,100 134,100 L118,96 C114,92 112,86 112,86 Z',
  },
  // TORSO - Pectorals
  {
    id: 'pectoral_izquierdo',
    label: 'Pectoral Izquierdo',
    path: 'M68,100 L82,96 C86,94 88,92 88,92 L100,92 L100,138 L72,138 C68,134 66,118 66,110 C66,104 67,101 68,100 Z',
  },
  {
    id: 'pectoral_derecho',
    label: 'Pectoral Derecho',
    path: 'M100,92 L112,92 C112,92 114,94 118,96 L132,100 C133,101 134,104 134,110 C134,118 132,134 128,138 L100,138 Z',
  },
  // TORSO - Intercostals
  {
    id: 'intercostal_izquierdo',
    label: 'Intercostal Izquierdo',
    path: 'M66,138 L72,138 L100,138 L100,174 L70,174 C68,168 66,154 66,146 Z',
  },
  {
    id: 'intercostal_derecho',
    label: 'Intercostal Derecho',
    path: 'M100,138 L128,138 L134,138 C134,146 132,168 130,174 L100,174 Z',
  },
  // TORSO - Abdomen
  {
    id: 'abdomen',
    label: 'Abdomen',
    path: 'M70,174 L130,174 C130,180 128,196 126,210 L118,218 L100,222 L82,218 L74,210 C72,196 70,180 70,174 Z',
  },
  // ARMS - Upper
  {
    id: 'brazo_izquierdo',
    label: 'Brazo Izquierdo',
    path: 'M60,100 C56,102 50,108 46,118 C42,128 38,142 36,156 L50,158 C52,144 56,130 60,118 L66,110 C66,104 64,101 60,100 Z',
  },
  {
    id: 'brazo_derecho',
    label: 'Brazo Derecho',
    path: 'M140,100 C144,102 150,108 154,118 C158,128 162,142 164,156 L150,158 C148,144 144,130 140,118 L134,110 C134,104 136,101 140,100 Z',
  },
  // ARMS - Forearms
  {
    id: 'antebrazo_izquierdo',
    label: 'Antebrazo Izquierdo',
    path: 'M36,156 L50,158 C48,178 44,198 38,220 C36,228 32,238 28,248 L16,244 C20,234 24,222 28,210 C32,192 34,174 36,156 Z',
  },
  {
    id: 'antebrazo_derecho',
    label: 'Antebrazo Derecho',
    path: 'M150,158 L164,156 C166,174 168,192 172,210 C176,222 180,234 184,244 L172,248 C168,238 164,228 162,220 C156,198 152,178 150,158 Z',
  },
  // ARMS - Hands
  {
    id: 'mano_izquierda',
    label: 'Mano Izquierda',
    path: 'M16,244 L28,248 C26,254 22,264 18,272 C16,276 12,282 8,286 C4,288 2,286 4,282 C6,276 8,268 10,262 C8,268 4,278 2,284 C0,288 -2,286 0,282 C4,272 8,260 10,252 C6,262 2,274 -2,280 C-4,284 -6,282 -4,278 C0,268 6,254 10,244 L16,244 Z',
  },
  {
    id: 'mano_derecha',
    label: 'Mano Derecha',
    path: 'M172,248 L184,244 L190,244 C194,254 200,268 204,278 C206,282 204,284 202,280 C198,274 194,262 190,252 C192,260 196,272 200,282 C202,286 200,288 198,284 C194,278 192,268 190,262 C192,268 194,276 196,282 C198,286 196,288 192,286 C188,282 184,276 182,272 C178,264 174,254 172,248 Z',
  },
  // LOWER BODY - Hips
  {
    id: 'cadera',
    label: 'Cadera',
    path: 'M74,210 L82,218 L100,222 L118,218 L126,210 C128,222 130,232 130,238 L70,238 C70,232 72,222 74,210 Z',
  },
  // LOWER BODY - Glutes (mapped to hip/upper thigh area on front view)
  {
    id: 'gluteo_izquierdo',
    label: 'Gluteo Izquierdo',
    path: 'M70,238 L100,238 L100,256 L74,256 C72,250 70,244 70,238 Z',
  },
  {
    id: 'gluteo_derecho',
    label: 'Gluteo Derecho',
    path: 'M100,238 L130,238 C130,244 128,250 126,256 L100,256 Z',
  },
  // LOWER BODY - Thighs
  {
    id: 'muslo_izquierdo',
    label: 'Muslo Izquierdo',
    path: 'M74,256 L100,256 L100,320 C98,322 94,324 90,324 C84,324 80,322 78,318 C76,306 74,282 74,256 Z',
  },
  {
    id: 'muslo_derecho',
    label: 'Muslo Derecho',
    path: 'M100,256 L126,256 C126,282 124,306 122,318 C120,322 116,324 110,324 C106,324 102,322 100,320 Z',
  },
  // LOWER BODY - Knees
  {
    id: 'rodilla_izquierda',
    label: 'Rodilla Izquierda',
    path: 'M78,318 C80,322 84,326 90,326 C94,326 98,324 100,320 L100,346 C98,348 94,350 90,350 C84,350 80,348 78,344 Z',
  },
  {
    id: 'rodilla_derecha',
    label: 'Rodilla Derecha',
    path: 'M100,320 C102,324 106,326 110,326 C116,326 120,322 122,318 L122,344 C120,348 116,350 110,350 C106,350 102,348 100,346 Z',
  },
  // LOWER BODY - Shins/Calves
  {
    id: 'pierna_izquierda',
    label: 'Pierna Izquierda',
    path: 'M78,344 C80,348 84,350 90,350 C94,350 98,348 100,346 L100,404 C98,406 94,408 92,408 C86,408 82,404 80,400 Z',
  },
  {
    id: 'pierna_derecha',
    label: 'Pierna Derecha',
    path: 'M100,346 C102,348 106,350 110,350 C116,350 120,348 122,344 L120,400 C118,404 114,408 108,408 C106,408 102,406 100,404 Z',
  },
  // LOWER BODY - Ankles
  {
    id: 'tobillo_izquierdo',
    label: 'Tobillo Izquierdo',
    path: 'M80,400 C82,404 86,408 92,408 C94,408 98,406 100,404 L100,420 C98,422 94,424 90,424 C84,424 80,420 80,416 Z',
  },
  {
    id: 'tobillo_derecho',
    label: 'Tobillo Derecho',
    path: 'M100,404 C102,406 106,408 108,408 C114,408 118,404 120,400 L120,416 C120,420 116,424 110,424 C106,424 102,422 100,420 Z',
  },
  // LOWER BODY - Feet
  {
    id: 'pie_izquierdo',
    label: 'Pie Izquierdo',
    path: 'M80,416 C80,420 84,424 90,424 C94,424 98,422 100,420 L100,432 C100,438 96,442 88,444 C78,446 70,442 68,436 C66,430 70,422 76,418 Z',
  },
  {
    id: 'pie_derecho',
    label: 'Pie Derecho',
    path: 'M100,420 C102,422 106,424 110,424 C116,424 120,420 120,416 L124,418 C130,422 134,430 132,436 C130,442 122,446 112,444 C104,442 100,438 100,432 Z',
  },
]

// Full body silhouette outline (non-interactive background)
const BODY_SILHOUETTE_PATH = `
  M100,6
  C122,6 140,20 141,42
  C142,56 134,66 126,70
  L128,72 C134,74 142,80 146,86
  C152,88 160,96 166,112
  C172,130 176,152 178,168
  C180,180 182,196 186,214
  C190,230 196,248 200,262
  C204,276 204,288 196,286
  C192,284 186,272 182,260
  C178,248 174,234 170,220
  C166,200 162,178 158,160
  C150,162 142,152 138,142
  C136,150 136,170 134,190
  C132,210 132,234 134,244
  C134,260 134,272 132,290
  C130,308 128,326 126,340
  C124,356 122,368 122,380
  C122,396 122,412 124,424
  C128,432 136,440 136,446
  C136,450 128,448 118,446
  C108,444 102,440 100,434

  C98,440 92,444 82,446
  C72,448 64,450 64,446
  C64,440 72,432 76,424
  C78,412 78,396 78,380
  C78,368 76,356 74,340
  C72,326 70,308 68,290
  C66,272 66,260 66,244
  C68,234 68,210 66,190
  C64,170 64,150 62,142
  C58,152 50,162 42,160
  C38,178 34,200 30,220
  C26,234 22,248 18,260
  C14,272 8,284 4,286
  C-4,288 -4,276 0,262
  C4,248 10,230 14,214
  C18,196 20,180 22,168
  C24,152 28,130 34,112
  C40,96 48,88 54,86
  C58,80 66,74 72,72
  L74,70
  C66,66 58,56 59,42
  C60,20 78,6 100,6
  Z
`

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
    'PECHO': 'pectoral_izquierdo',
    'PECTORAL IZQUIERDO': 'pectoral_izquierdo',
    'PECHO IZQUIERDO': 'pectoral_izquierdo',
    'PECTORAL DERECHO': 'pectoral_derecho',
    'PECHO DERECHO': 'pectoral_derecho',
    'TORAX': 'pectoral_izquierdo',
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
    'ESPALDA': 'abdomen',
    'ESPALDA ALTA': 'abdomen',
    'ESPALDA BAJA': 'abdomen',
    'LUMBAR': 'abdomen',
    'DORSAL': 'abdomen',
    'COLUMNA': 'abdomen',
    'ANTEBRAZO IZQUIERDO': 'antebrazo_izquierdo',
    'ANTEBRAZO POSTERIOR IZQUIERDO': 'antebrazo_izquierdo',
    'ANTEBRAZO ANTERIOR IZQUIERDO': 'antebrazo_izquierdo',
    'ANTEBRAZO IZQ': 'antebrazo_izquierdo',
    'ANTEBRAZO DERECHO': 'antebrazo_derecho',
    'ANTEBRAZO POSTERIOR DERECHO': 'antebrazo_derecho',
    'ANTEBRAZO ANTERIOR DERECHO': 'antebrazo_derecho',
    'ANTEBRAZO DER': 'antebrazo_derecho',
    'ANTEBRAZO': 'antebrazo_derecho',
    'MUNECA IZQUIERDA': 'antebrazo_izquierdo',
    'MUNECA DERECHA': 'antebrazo_derecho',
    'MUNECA': 'antebrazo_derecho',
    'MANO IZQUIERDA': 'mano_izquierda',
    'MANO POSTERIOR IZQUIERDO': 'mano_izquierda',
    'MANO IZQ': 'mano_izquierda',
    'MANO DERECHA': 'mano_derecha',
    'MANO POSTERIOR DERECHO': 'mano_derecha',
    'MANO DER': 'mano_derecha',
    'MANO': 'mano_derecha',
    'DEDO': 'mano_derecha',
    'DEDOS': 'mano_derecha',
    'DEDO MANO DERECHA': 'mano_derecha',
    'DEDO MANO IZQUIERDA': 'mano_izquierda',
    'CADERA': 'cadera',
    'PELVIS': 'cadera',
    'INGLE': 'cadera',
    'GLUTEO': 'gluteo_derecho',
    'GLUTEOS': 'gluteo_derecho',
    'GLUTEO DERECHO': 'gluteo_derecho',
    'GLUTEO IZQUIERDO': 'gluteo_izquierdo',
    'GLUTEO MEDIO DERECHO': 'gluteo_derecho',
    'GLUTEO MEDIO IZQUIERDO': 'gluteo_izquierdo',
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
  if (count === 1) return 0.6
  if (count === 2) return 0.6
  if (count === 3) return 0.6
  return 0.7
}

function formatDate(dateStr: string): string {
  // Try to parse and format as DD/MM/YYYY
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }
  return dateStr
}

export default function BodyMap({ data }: BodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<BodyPartData | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const svgContainerRef = useRef<HTMLDivElement>(null)

  // Build a mapping from region ID to body part data
  const regionData = useMemo(() => {
    const map: Record<string, { count: number; percentage: number; parts: BodyPartData[] }> = {}

    if (!data?.parts) return map

    for (const part of data.parts) {
      const regionId = normalizeBodyPart(part.name)
      if (!regionId) continue
      if (!map[regionId]) {
        map[regionId] = { count: 0, percentage: 0, parts: [] }
      }
      map[regionId].count += part.count
      map[regionId].percentage += part.percentage
      map[regionId].parts.push(part)
    }

    return map
  }, [data])

  const handleRegionClick = (regionId: string) => {
    const rd = regionData[regionId]
    if (rd && rd.parts.length > 0) {
      const merged: BodyPartData = {
        name: BODY_REGIONS.find((r) => r.id === regionId)?.label || regionId,
        count: rd.count,
        percentage: rd.parts.reduce((acc, p) => acc + p.percentage, 0),
        incidents: rd.parts.flatMap((p) => p.incidents),
      }
      setSelectedPart(merged)
      setSelectedRegionId(regionId)
    }
  }

  const handleMouseMove = (e: React.MouseEvent, regionId: string) => {
    setHoveredRegion(regionId)
    if (svgContainerRef.current) {
      const containerRect = svgContainerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top - 10,
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredRegion(null)
  }

  const hoveredData = hoveredRegion ? regionData[hoveredRegion] : null
  const hoveredLabel = hoveredRegion
    ? BODY_REGIONS.find((r) => r.id === hoveredRegion)?.label
    : null

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg shadow-black/20">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-orange-400" />
        <h3 className="text-sm font-semibold text-gray-200">
          Mapa Corporal de Incidentes
        </h3>
      </div>

      <div className="flex gap-6">
        {/* SVG Body - Left side (~45%) */}
        <div className="w-[45%] flex-shrink-0 flex flex-col items-center">
          <div ref={svgContainerRef} className="relative w-full flex justify-center py-2">
            <svg
              viewBox="0 0 200 450"
              className="w-full max-w-[220px] h-auto"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Glow filters for each color */}
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#22c55e" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#eab308" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#f97316" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor="#ef4444" floodOpacity="0.6" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background silhouette */}
              <path
                d={BODY_SILHOUETTE_PATH}
                fill="rgba(55, 65, 81, 0.15)"
                stroke="none"
                style={{ pointerEvents: 'none' }}
              />

              {/* Interactive body regions */}
              {BODY_REGIONS.map((region) => {
                const rd = regionData[region.id]
                const count = rd?.count || 0
                const fill = getColorByCount(count)
                const baseOpacity = getOpacityByCount(count)
                const isHovered = hoveredRegion === region.id
                const isSelected = selectedRegionId === region.id

                // Pick glow filter based on color
                let glowFilter: string | undefined
                if (isHovered && count > 0) {
                  if (count === 1) glowFilter = 'url(#glow-green)'
                  else if (count === 2) glowFilter = 'url(#glow-yellow)'
                  else if (count === 3) glowFilter = 'url(#glow-orange)'
                  else glowFilter = 'url(#glow-red)'
                }

                return (
                  <path
                    key={region.id}
                    d={region.path}
                    fill={fill}
                    opacity={isHovered ? 0.8 : baseOpacity}
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : isHovered
                          ? 'rgba(209, 213, 219, 0.6)'
                          : 'rgba(156, 163, 175, 0.2)'
                    }
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    cursor="pointer"
                    filter={glowFilter}
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                    onMouseMove={(e) => handleMouseMove(e, region.id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleRegionClick(region.id)}
                  />
                )
              })}
            </svg>

            {/* Tooltip */}
            {hoveredRegion && hoveredLabel && (
              <div
                className="absolute pointer-events-none bg-gray-900 border border-gray-600 rounded-lg shadow-xl px-3 py-2 text-sm text-gray-200 z-50"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-bold text-white">{hoveredLabel}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-gray-300">
                    {hoveredData?.count || 0} incidentes
                  </span>
                  {hoveredData && hoveredData.percentage > 0 && (
                    <span className="text-gray-400">
                      {hoveredData.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Color legend */}
          <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151', opacity: 0.4 }} />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e', opacity: 0.6 }} />
              <span>1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308', opacity: 0.6 }} />
              <span>2</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316', opacity: 0.6 }} />
              <span>3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444', opacity: 0.7 }} />
              <span>4+</span>
            </div>
          </div>
        </div>

        {/* Detail Panel - Right side (~55%) */}
        <div className="w-[55%] min-w-0">
          {selectedPart ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-gray-100">
                  {selectedPart.name}
                </h4>
                <button
                  onClick={() => {
                    setSelectedPart(null)
                    setSelectedRegionId(null)
                  }}
                  className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-700/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats badges */}
              <div className="flex gap-3 mb-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                  <p className="text-xl font-bold text-orange-400">{selectedPart.count}</p>
                  <p className="text-[10px] text-orange-300/60 uppercase tracking-wide">Incidentes</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <p className="text-xl font-bold text-blue-400">
                    {selectedPart.percentage.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-blue-300/60 uppercase tracking-wide">Del total</p>
                </div>
              </div>

              {/* Incident list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {selectedPart.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-gray-200 leading-snug">
                      {inc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-500">
                        {formatDate(inc.date)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-700/80 rounded text-gray-300 font-medium">
                        {inc.classifier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm italic">
                Seleccione una zona del cuerpo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
