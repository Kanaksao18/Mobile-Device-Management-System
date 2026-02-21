import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { login, isAuthenticating } = useAuth()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await login(formData.username, formData.password)
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid username or password')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">MoveInSync</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">MDM Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in with your admin credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="username">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-purple-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-purple-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={isAuthenticating} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isAuthenticating ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
