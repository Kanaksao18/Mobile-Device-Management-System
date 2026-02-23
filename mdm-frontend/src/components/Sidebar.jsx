import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Devices', path: '/devices' },
  { label: 'Add Device', path: '/devices/add' },
  { label: 'Device Timeline', path: '/device-timeline' },
  { label: 'App Versions', path: '/versions' },
  { label: 'Compatibility', path: '/compatibility' },
  { label: 'Rollout Scheduler', path: '/rollout/scheduler' },
  { label: 'Rollout Monitoring', path: '/rollout/monitoring' },
  { label: 'Audit Logs', path: '/audit' },
  { label: 'Metrics', path: '/metrics' },
]

function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 lg:block">
        <SidebarContent onClose={onClose} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarContent({ onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">MDM Console</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Admin Portal</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `interactive-surface block rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
