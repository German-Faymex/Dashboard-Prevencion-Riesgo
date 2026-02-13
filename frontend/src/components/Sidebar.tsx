import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, Upload, Shield } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidentes', icon: AlertTriangle },
  { to: '/uploads', label: 'Cargas', icon: Upload },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-900 border-r border-gray-700 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-700">
        <Shield className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-lg font-bold text-gray-100 leading-tight">Dashboard SST</h1>
          <p className="text-xs text-gray-500">Seguridad y Salud</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Branding */}
      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-600 font-medium tracking-wider uppercase">Faymex</p>
        <p className="text-[10px] text-gray-700">Prevención de Riesgos</p>
      </div>
    </aside>
  )
}
