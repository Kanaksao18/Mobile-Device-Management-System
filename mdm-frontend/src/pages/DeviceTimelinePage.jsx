import { useEffect, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function DeviceTimelinePage() {
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/api/device')
        setDevices(Array.isArray(response.data) ? response.data : [])
      } catch {
        setDevices([])
      }
    }
    void fetchDevices()
  }, [])

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!deviceId) {
        setRows([])
        return
      }
      setLoading(true)
      try {
        const response = await api.get(`/api/device/${deviceId}/timeline`)
        setRows(Array.isArray(response.data) ? response.data : [])
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    void fetchTimeline()
  }, [deviceId])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="mb-2 block text-sm font-medium">Device</label>
        <select
          value={deviceId}
          onChange={(event) => setDeviceId(event.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="">Select device</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.imei || `Device ${device.id}`}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading timeline..." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <ol className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{row.action}</span>
                  <span className="text-xs text-slate-500">{row.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{row.details || '-'}</p>
              </li>
            ))}
            {!rows.length && (
              <li className="py-4 text-center text-slate-500">
                {deviceId ? 'No timeline events found.' : 'Select a device to view timeline.'}
              </li>
            )}
          </ol>
        </div>
      )}
    </section>
  )
}

export default DeviceTimelinePage
