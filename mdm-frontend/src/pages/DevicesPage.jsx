import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'

function DevicesPage() {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true)
      try {
        const response = await api.get('/api/device')
        setDevices(Array.isArray(response.data) ? response.data : response.data?.content || [])
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const regions = useMemo(() => ['all', ...new Set(devices.map((device) => device.region).filter(Boolean))], [devices])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return devices.filter((device) => {
      const matchRegion = region === 'all' || (device.region || '').toLowerCase() === region.toLowerCase()
      const matchSearch = !query || [device.imei, device.model, device.os, device.region, device.appVersion, device.lastOpenTime].filter(Boolean).join(' ').toLowerCase().includes(query)
      return matchRegion && matchSearch
    })
  }, [devices, region, search])

  useEffect(() => {
    setPage(1)
  }, [search, region])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [filtered.length, page, pageSize])

  const paginatedDevices = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  if (loading) {
    return <LoadingSpinner label="Loading devices..." />
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center">
        <input type="text" placeholder="Search by IMEI, model, OS, region, version" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800" />

        <select value={region} onChange={(event) => setRegion(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800">
          {regions.map((entry) => (
            <option key={entry} value={entry}>
              {entry === 'all' ? 'All Regions' : entry}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              {['IMEI', 'Model', 'OS', 'Region', 'App Version', 'Last Open Time', 'Active'].map((head) => (
                <th key={head} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedDevices.map((device, index) => (
              <tr key={device.id || device.imei || index} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-4 py-3">{device.imei || '-'}</td>
                <td className="px-4 py-3">{device.model || '-'}</td>
                <td className="px-4 py-3">{device.os || '-'}</td>
                <td className="px-4 py-3">{device.region || '-'}</td>
                <td className="px-4 py-3">{device.appVersion || '-'}</td>
                <td className="px-4 py-3">{device.lastOpenTime || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${device.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                    {device.active ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>No devices found.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </div>
    </section>
  )
}

export default DevicesPage
