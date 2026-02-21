import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const THEME_KEY = 'mdm_theme'

function AppLayout() {
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }, [isDarkMode])

  return (
    <div className="app-gradient-bg min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen lg:pl-64">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode((value) => !value)} onLogout={logout} />
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
