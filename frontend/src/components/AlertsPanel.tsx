import { TrendingUp, TrendingDown, Minus, AlertCircle, Info, AlertTriangle as WarnIcon } from 'lucide-react'
import type { TrendsData } from '../types'

interface AlertsPanelProps {
  data: TrendsData | null
}

function formatPesos(value: number): string {
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(value))
}

export default function AlertsPanel({ data }: AlertsPanelProps) {
  if (!data) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse h-96" />
    )
  }

  const momChange = data.month_over_month_change
  const costTrend = data.cost_trend

  const severityConfig = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: Info,
      label: 'Info',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: WarnIcon,
      label: 'Alerta',
    },
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: AlertCircle,
      label: 'Crítico',
    },
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Tendencias y Alertas</h3>

      {/* Trend indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Month over month */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Variación Mensual</p>
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
        </div>

        {/* Cost trend */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Tendencia Costos</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${
                costTrend > 0 ? 'text-red-400' : costTrend < 0 ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              {costTrend > 0 ? '+' : ''}{formatPesos(costTrend)}
            </span>
          </div>
        </div>
      </div>

      {/* Most affected */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Parte más afectada</p>
          <p className="text-sm font-semibold text-orange-400">{data.most_affected_body_part.name}</p>
          <p className="text-xs text-gray-500">{data.most_affected_body_part.count} incidentes</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Tipificador más común</p>
          <p className="text-sm font-semibold text-purple-400">{data.most_common_classifier.name}</p>
          <p className="text-xs text-gray-500">{data.most_common_classifier.count} incidentes</p>
        </div>
      </div>

      {/* Alerts list */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alertas</p>
          {data.alerts.map((alert, idx) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon
            return (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2.5 rounded-lg border ${config.bg} ${config.border}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.text}`} />
                <div className="min-w-0">
                  <span className={`text-[10px] font-medium uppercase ${config.text}`}>
                    {config.label}
                  </span>
                  <p className="text-xs text-gray-300 mt-0.5">{alert.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
