import { AlertTriangle, Flame, Clock, DollarSign, Activity, Users, TrendingUp, TrendingDown } from 'lucide-react'
import type { KPIs } from '../types'

interface KPICardsProps {
  kpis: KPIs | null
}

function formatPesos(value: number): string {
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(value))
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CL').format(value)
}

interface CardConfig {
  label: string
  getValue: (k: KPIs) => string
  icon: typeof AlertTriangle
  color: string
  borderColor: string
  bgColor: string
  trend?: (k: KPIs) => { value: number; type: 'increase' | 'decrease' | 'neutral' }
}

const cards: CardConfig[] = [
  {
    label: 'Total Incidentes',
    getValue: (k) => formatNumber(k.total_incidents),
    icon: AlertTriangle,
    color: 'text-orange-400',
    borderColor: 'border-l-orange-500',
    bgColor: 'bg-orange-500/10',
    trend: (k) => {
      const diff = k.incidents_this_month - k.incidents_prev_month
      return {
        value: k.incidents_prev_month > 0 ? Math.round((diff / k.incidents_prev_month) * 100) : 0,
        type: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'neutral',
      }
    },
  },
  {
    label: 'Total Accidentes',
    getValue: (k) => formatNumber(k.total_accidents),
    icon: Flame,
    color: 'text-red-400',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    label: 'Días Perdidos',
    getValue: (k) => formatNumber(k.total_lost_days),
    icon: Clock,
    color: 'text-blue-400',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    label: 'Costo Total',
    getValue: (k) => formatPesos(k.total_cost),
    icon: DollarSign,
    color: 'text-green-400',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-500/10',
    trend: (k) => {
      const diff = k.cost_this_month - k.cost_prev_month
      return {
        value: k.cost_prev_month > 0 ? Math.round((diff / k.cost_prev_month) * 100) : 0,
        type: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'neutral',
      }
    },
  },
  {
    label: 'Casos Activos',
    getValue: (k) => formatNumber(k.active_cases),
    icon: Activity,
    color: 'text-yellow-400',
    borderColor: 'border-l-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    label: 'Promedio Edad',
    getValue: (k) => k.avg_age > 0 ? k.avg_age.toFixed(1) : '-',
    icon: Users,
    color: 'text-purple-400',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-500/10',
  },
]

export default function KPICards({ kpis }: KPICardsProps) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 border-l-4 border-gray-700 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon
        const trend = card.trend ? card.trend(kpis) : null

        return (
          <div
            key={card.label}
            className={`bg-gray-800 rounded-xl p-4 border-l-4 ${card.borderColor} hover:bg-gray-750 transition-colors`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              {trend && trend.type !== 'neutral' && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    trend.type === 'increase' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {trend.type === 'increase' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            <p className="text-xl font-bold text-gray-100">{card.getValue(kpis)}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
