import { useEffect, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import Pagination from '../components/Pagination'

function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/audit', {
          params: {
            page: page - 1,
            size: pageSize,
            sortBy: 'timestamp',
            sortDir: 'desc',
          },
        })
        if (Array.isArray(response.data)) {
          setRows(response.data)
          setTotalItems(response.data.length)
          return
        }
        setRows(Array.isArray(response.data?.content) ? response.data.content : [])
        setTotalItems(response.data?.totalElements ?? 0)
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [page, pageSize])

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
      <Pagination
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </section>
  )
}

export default AuditLogsPage
