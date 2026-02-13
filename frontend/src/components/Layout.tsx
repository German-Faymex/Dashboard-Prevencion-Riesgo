import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div data-no-print>
        <Sidebar />
      </div>
      <main className="ml-60 min-h-screen p-6 print:ml-0 print:p-4">
        {children}
      </main>
    </div>
  )
}
