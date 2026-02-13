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
  accentColor: string
  iconBg: string
  trend?: (k: KPIs) => { value: number; type: 'increase' | 'decrease' | 'neutral' }
}

const cards: CardConfig[] = [
  {
    label: 'Total Incidentes',
    getValue: (k) => formatNumber(k.total_incidents),
    icon: AlertTriangle,
    color: 'text-orange-400',
    accentColor: 'bg-orange-500',
    iconBg: 'bg-orange-500/20',
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
    accentColor: 'bg-red-500',
    iconBg: 'bg-red-500/20',
  },
  {
    label: 'Dias Perdidos',
    getValue: (k) => formatNumber(k.total_lost_days),
    icon: Clock,
    color: 'text-blue-400',
    accentColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/20',
  },
  {
    label: 'Costo Total',
    getValue: (k) => formatPesos(k.total_cost),
    icon: DollarSign,
    color: 'text-green-400',
    accentColor: 'bg-green-500',
    iconBg: 'bg-green-500/20',
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
    accentColor: 'bg-yellow-500',
    iconBg: 'bg-yellow-500/20',
  },
  {
    label: 'Promedio Edad',
    getValue: (k) => k.avg_age > 0 ? k.avg_age.toFixed(1) : '-',
    icon: Users,
    color: 'text-purple-400',
    accentColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
  },
]

export default function KPICards({ kpis }: KPICardsProps) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg shadow-black/20 animate-pulse h-28" />
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
            className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg shadow-black/20 hover:scale-[1.02] transition-all duration-200 overflow-hidden"
          >
            {/* Colored top accent border */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${card.accentColor}`} />

            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-full ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {trend && trend.type !== 'neutral' && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    trend.type === 'increase'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
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
            <p className="text-3xl font-bold text-gray-100 tracking-tight">{card.getValue(kpis)}</p>
            <p className="text-xs text-gray-400 mt-1.5">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
