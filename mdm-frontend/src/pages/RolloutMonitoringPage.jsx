import { useEffect, useMemo, useState } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import Pagination from '../components/Pagination'

function RolloutMonitoringPage() {
  const [scheduleId, setScheduleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const fetchRows = async (selectedScheduleId, currentPage, currentPageSize) => {
    if (!selectedScheduleId) {
      setRows([])
      setTotalItems(0)
      return
    }

    setLoading(true)
    try {
      const response = await api.get('/api/device-update', {
        params: {
          scheduleId: selectedScheduleId,
          page: currentPage - 1,
          size: currentPageSize,
          sortBy: 'id',
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

  useEffect(() => {
    fetchRows(scheduleId, page, pageSize)
  }, [scheduleId, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [scheduleId])

  const paginatedRows = useMemo(() => rows, [rows])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="mb-2 block text-sm font-medium">Schedule ID</label>
        <input type="text" value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} placeholder="Enter schedule ID" className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800" />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading rollout monitoring data..." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                {['Device', 'Current State', 'Failure Reason'].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr key={row.id || row.deviceId || index} className="border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3">{row.device || row.deviceId || '-'}</td>
                  <td className="px-4 py-3">{row.currentState || row.state || '-'}</td>
                  <td className="px-4 py-3">{row.failureReason || '-'}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={3}>{scheduleId ? 'No monitoring records found.' : 'Enter a schedule ID to view monitoring data.'}</td></tr>
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
        </div>
      )}
    </section>
  )
}

export default RolloutMonitoringPage
