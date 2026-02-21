import { useLocation } from 'react-router-dom'

const titleMap = {
  '/dashboard': 'Dashboard',
  '/devices': 'Devices',
  '/devices/add': 'Add Device',
  '/device-timeline': 'Device Timeline',
  '/versions': 'App Version Management',
  '/compatibility': 'Version Compatibility Matrix',
  '/rollout/scheduler': 'Rollout Scheduler',
  '/rollout/monitoring': 'Rollout Monitoring',
  '/audit': 'Audit Logs',
  '/metrics': 'Metrics',
}

function Topbar({ onMenuClick, isDarkMode, onThemeToggle, onLogout }) {
  const location = useLocation()
  const title = titleMap[location.pathname] || 'MDM Admin'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 lg:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} className="interactive-surface rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden">
          Menu
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onThemeToggle} className="interactive-surface rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
          {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        <button type="button" onClick={onLogout} className="interactive-surface rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:from-slate-800 hover:to-slate-600 dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-200 dark:hover:to-slate-300">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Topbar
