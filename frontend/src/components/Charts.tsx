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

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '12px',
  },
  itemStyle: { color: '#f3f4f6' },
}

function formatPesos(value: number): string {
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(value))
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function TypePieChart({ data }: { data: ChartsData }) {
  const pieData = data.by_type.map((d) => ({ name: d.name, value: d.count || 0 }))
  const typeColors = ['#f97316', '#ef4444']

  return (
    <ChartCard title="Por Tipo">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={typeColors[idx % typeColors.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ClassifierBarChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Por Tipificador">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.by_classifier} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.by_classifier.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function WorkCenterBarChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Por Centro de Trabajo">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.by_work_center}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            {data.by_work_center.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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
    <ChartCard title="Tendencia Mensual">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="Incidentes"
            stroke="#f97316"
            fill="url(#colorIncidents)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Accidentes"
            stroke="#ef4444"
            fill="url(#colorAccidents)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function CostByClassifierChart({ data }: { data: ChartsData }) {
  return (
    <ChartCard title="Costos por Tipificador">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.cost_by_classifier}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => formatPesos(v)} />
          <Tooltip {...tooltipStyle} formatter={(value) => formatPesos(Number(value))} />
          <Bar dataKey="total_cost" fill="#22c55e" radius={[4, 4, 0, 0]}>
            {data.cost_by_classifier.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function AttentionPieChart({ data }: { data: ChartsData }) {
  const pieData = data.by_attention.map((d) => ({ name: d.name, value: d.count || 0 }))
  const attColors = ['#06b6d4', '#a855f7']

  return (
    <ChartCard title="Por Atención">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={attColors[idx % attColors.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
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
          <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse h-72" />
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
