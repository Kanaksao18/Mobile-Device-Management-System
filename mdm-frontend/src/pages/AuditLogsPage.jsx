import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/audit')
        setRows(Array.isArray(response.data) ? response.data : response.data?.content || [])
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [])

  if (loading) return <LoadingSpinner label="Loading audit logs..." />

  return (
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/80">
          <tr>
            {['Actor', 'Action', 'Details', 'Timestamp'].map((head) => (
              <th key={head} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-t border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3">{row.actor || '-'}</td>
              <td className="px-4 py-3">{row.action || '-'}</td>
              <td className="px-4 py-3">{row.details || '-'}</td>
              <td className="px-4 py-3">{row.timestamp || '-'}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={4}>No audit logs found.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

export default AuditLogsPage
