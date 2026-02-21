import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/dashboard/summary')
      setSummary(response?.data || null)
      setError('')
    } catch {
      setSummary(null)
      setError('Dashboard data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) return <LoadingSpinner label="Loading dashboard metrics..." />

  const versionRows = Object.entries(summary?.versionDistribution || {})
  const regionRows = Object.entries(summary?.regionDistribution || {})
  const rolloutRows = summary?.rolloutProgress || []

  return (
    <section className="space-y-6">
      {error && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Devices" value={summary?.totalDevices ?? 0} accent="slate" />
        <StatCard label="Active Devices" value={summary?.activeDevices ?? 0} accent="green" />
        <StatCard label="Inactive Devices" value={summary?.inactiveDevices ?? 0} accent="amber" />
        <StatCard label="Active Rollouts" value={rolloutRows.filter((item) => item.status === 'ACTIVE').length} accent="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Version Distribution">
          <SimpleTable headers={['Version', 'Devices']} rows={versionRows} empty="No version data." />
        </Panel>
        <Panel title="Region Distribution">
          <SimpleTable headers={['Region', 'Devices']} rows={regionRows} empty="No region data." />
        </Panel>
      </div>

      <Panel title="Rollout Progress">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Schedule', 'From -> To', 'Region', 'Status', 'Success %', 'Failure %'].map((head) => (
                  <th key={head} className="px-3 py-2 text-left font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolloutRows.map((row) => (
                <tr key={row.scheduleId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2">{row.scheduleId}</td>
                  <td className="px-3 py-2">{row.fromVersion} -&gt; {row.toVersion}</td>
                  <td className="px-3 py-2">{row.region || '-'}</td>
                  <td className="px-3 py-2">{row.status || '-'}</td>
                  <td className="px-3 py-2">{row.successRate ?? 0}</td>
                  <td className="px-3 py-2">{row.failureRate ?? 0}</td>
                </tr>
              ))}
              {!rolloutRows.length && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>No rollout data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function SimpleTable({ headers, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((head) => (
              <th key={head} className="px-3 py-2 text-left font-semibold">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, count]) => (
            <tr key={name} className="border-b border-slate-100 dark:border-slate-800">
              <td className="px-3 py-2">{name}</td>
              <td className="px-3 py-2">{count}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={2}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DashboardPage
