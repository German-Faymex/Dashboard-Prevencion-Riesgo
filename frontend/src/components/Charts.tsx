import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, ResponsiveContainer, Legend,
} from 'recharts'
import type { ChartsData } from '../types'

interface ChartsProps {
  data: ChartsData | null
  section?: 'top' | 'bottom'
}

const COLORS = ['#f97316', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#ec4899']

function formatPesos(value: number): string {
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(value))
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3">
      {label && <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-gray-100 font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomCostTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3">
      {label && <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-gray-100 font-semibold">{formatPesos(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ChartCardProps {
  title: string
  accentColor: string
  children: React.ReactNode
}

function ChartCard({ title, accentColor, children }: ChartCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-black/20 relative overflow-hidden">
      {/* Colored left accent border */}
      <div className="absolute top-0 left-0 bottom-0 w-0.5" style={{ backgroundColor: accentColor }} />
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
        {title}
      </h3>
      {children}
    </div>
  )
}

function TypePieChart({ data }: { data: ChartsData }) {
  const pieData = data.by_type.map((d) => ({ name: d.name, value: d.count || 0 }))
  const typeColors = ['#f97316', '#ef4444']

  return (
    <ChartCard title="Por Tipo" accentColor="#f97316">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <defs>
            <linearGradient id="pieOrange" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="pieRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={idx === 0 ? 'url(#pieOrange)' : idx === 1 ? 'url(#pieRed)' : typeColors[idx % typeColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ClassifierBarChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Por Tipificador" accentColor="#3b82f6">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.by_classifier} layout="vertical" margin={{ left: 20 }}>
          <defs>
            {COLORS.map((color, idx) => (
              <linearGradient key={idx} id={`barGradClassifier${idx}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.by_classifier.map((_, idx) => (
              <Cell key={idx} fill={`url(#barGradClassifier${idx % COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function WorkCenterBarChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Por Centro de Trabajo" accentColor="#22c55e">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.by_work_center}>
          <defs>
            {COLORS.map((color, idx) => (
              <linearGradient key={idx} id={`barGradWork${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.by_work_center.map((_, idx) => (
              <Cell key={idx} fill={`url(#barGradWork${idx % COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function MonthlyAreaChart({ data }: { data: ChartsData }) {
  const monthlyData = data.by_month.map((d) => ({
    label: `${d.month}/${d.year}`,
    Incidentes: d.incidents,
    Accidentes: d.accidents,
    Costo: d.cost,
  }))

  return (
    <ChartCard title="Tendencia Mensual" accentColor="#eab308">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="areaGradIncidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGradAccidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="Incidentes"
            stroke="#f97316"
            fill="url(#areaGradIncidents)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Accidentes"
            stroke="#ef4444"
            fill="url(#areaGradAccidents)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function CostByClassifierChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Costos por Tipificador" accentColor="#a855f7">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.cost_by_classifier}>
          <defs>
            {COLORS.map((color, idx) => (
              <linearGradient key={idx} id={`barGradCost${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => formatPesos(v)} />
          <Tooltip content={<CustomCostTooltip />} />
          <Bar dataKey="total_cost" radius={[4, 4, 0, 0]}>
            {data.cost_by_classifier.map((_, idx) => (
              <Cell key={idx} fill={`url(#barGradCost${idx % COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function AttentionPieChart({ data }: { data: ChartsData }) {
  const pieData = data.by_attention.map((d) => ({ name: d.name, value: d.count || 0 }))

  return (
    <ChartCard title="Por Atencion" accentColor="#06b6d4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <defs>
            <linearGradient id="pieCyan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="piePurple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={idx === 0 ? 'url(#pieCyan)' : 'url(#piePurple)'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default function Charts({ data, section = 'top' }: ChartsProps) {
  if (!data) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6`}>
        {Array.from({ length: section === 'top' ? 4 : 2 }).map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 shadow-lg shadow-black/20 animate-pulse h-72" />
        ))}
      </div>
    )
  }

  if (section === 'top') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <TypePieChart data={data} />
        <ClassifierBarChart data={data} />
        <WorkCenterBarChart data={data} />
        <MonthlyAreaChart data={data} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <CostByClassifierChart data={data} />
      <AttentionPieChart data={data} />
    </div>
  )
}
