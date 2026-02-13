import { TrendingUp, TrendingDown, Minus, AlertCircle, Info, AlertTriangle as WarnIcon, AlertOctagon, Activity, Tag } from 'lucide-react'
import type { TrendsData } from '../types'

interface AlertsPanelProps {
  data: TrendsData | null
}

export default function AlertsPanel({ data }: AlertsPanelProps) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-black/20 animate-pulse h-96" />
    )
  }

  const momChange = data.month_over_month_change
  const costTrend = data.cost_trend

  const severityConfig = {
    info: {
      borderColor: 'border-l-blue-500',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400',
      icon: Info,
      label: 'Info',
    },
    warning: {
      borderColor: 'border-l-amber-500',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      icon: WarnIcon,
      label: 'Alerta',
    },
    danger: {
      borderColor: 'border-l-red-500',
      bg: 'bg-red-500/5',
      text: 'text-red-400',
      icon: AlertOctagon,
      label: 'Critico',
    },
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700/50 shadow-lg shadow-black/20">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Tendencias y Alertas</h3>

      {/* Trend indicators */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Month over month */}
        <div
          className={`rounded-lg p-3.5 border ${
            momChange > 0
              ? 'bg-red-500/10 border-red-500/30'
              : momChange < 0
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-gray-900 border-gray-700'
          }`}
        >
          <p className="text-xs text-gray-400 mb-1.5 font-medium">Variacion Mensual</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${
                momChange > 0 ? 'text-red-400' : momChange < 0 ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              {momChange > 0 ? '+' : ''}{momChange.toFixed(1)}%
            </span>
            {momChange > 0 ? (
              <TrendingUp className="w-5 h-5 text-red-400" />
            ) : momChange < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-400" />
            ) : (
              <Minus className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">vs. mes anterior</p>
        </div>

        {/* Cost trend */}
        <div
          className={`rounded-lg p-3.5 border ${
            costTrend > 0
              ? 'bg-red-500/10 border-red-500/30'
              : costTrend < 0
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-gray-900 border-gray-700'
          }`}
        >
          <p className="text-xs text-gray-400 mb-1.5 font-medium">Tendencia Costos</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${
                costTrend > 0 ? 'text-red-400' : costTrend < 0 ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              {costTrend > 0 ? '+' : ''}{costTrend.toFixed(1)}%
            </span>
            {costTrend > 0 ? (
              <TrendingUp className="w-5 h-5 text-red-400" />
            ) : costTrend < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-400" />
            ) : (
              <Minus className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">variacion en costos</p>
        </div>
      </div>

      {/* Most affected */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/80 rounded-lg p-3.5 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-full bg-orange-500/20">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Parte mas afectada</p>
          </div>
          <p className="text-sm font-semibold text-orange-400">
            {data.most_affected_body_part || 'Sin datos'}
          </p>
        </div>
        <div className="bg-gray-900/80 rounded-lg p-3.5 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-full bg-purple-500/20">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400 font-medium">Tipificador mas comun</p>
          </div>
          <p className="text-sm font-semibold text-purple-400">
            {data.most_common_classifier || 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Alerts list */}
      {data.alerts.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alertas</p>
          {data.alerts.map((alert, idx) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${config.borderColor} ${config.bg}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  <Icon className={`w-4 h-4 ${config.text}`} />
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
                    {config.label}
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
