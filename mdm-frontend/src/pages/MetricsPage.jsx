import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function toTitleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function prettyMetricName(baseName) {
  return toTitleCase(
    baseName
      .replace(/_total$/i, '')
      .replace(/_/g, ' ')
      .trim(),
  )
}

function parseLabels(rawLabels) {
  if (!rawLabels) return []
  return rawLabels
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const eqIdx = token.indexOf('=')
      if (eqIdx < 0) return { key: token, value: '' }
      const key = token.slice(0, eqIdx).trim()
      const value = token.slice(eqIdx + 1).trim().replace(/^"|"$/g, '')
      return { key, value }
    })
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let value = Math.abs(bytes)
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const signed = bytes < 0 ? -value : value
  const decimals = unitIndex === 0 ? 0 : 2
  return `${signed.toFixed(decimals)} ${units[unitIndex]}`
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds)) return '-'
  if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`
  if (seconds < 60) return `${seconds.toFixed(2)} s`
  return `${(seconds / 60).toFixed(2)} min`
}

function formatValue(baseName, rawValue) {
  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed)) return rawValue

  if (baseName.endsWith('_bytes')) return formatBytes(parsed)
  if (baseName.endsWith('_seconds')) return formatSeconds(parsed)
  if (baseName.endsWith('_ratio')) return `${(parsed * 100).toFixed(2)}%`
  if (Math.abs(parsed) >= 1000) return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return parsed.toString()
}

function parseMetricLine(metricPart) {
  const braceIdx = metricPart.indexOf('{')
  if (braceIdx < 0) {
    return { baseName: metricPart, labels: [] }
  }
  const baseName = metricPart.slice(0, braceIdx)
  const rawLabels = metricPart.slice(braceIdx + 1, metricPart.lastIndexOf('}'))
  return { baseName, labels: parseLabels(rawLabels) }
}

function parsePrometheus(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line, index) => {
      const spaceIdx = line.lastIndexOf(' ')
      if (spaceIdx < 0) return { id: index, rawName: line, displayName: line, category: 'Other', labels: [], value: '-' }

      const metricPart = line.slice(0, spaceIdx)
      const rawValue = line.slice(spaceIdx + 1)
      const { baseName, labels } = parseMetricLine(metricPart)
      const category = toTitleCase((baseName.split('_')[0] || 'Other').replace(/[^a-z0-9]/gi, ' '))

      return {
        id: index,
        rawName: metricPart,
        displayName: prettyMetricName(baseName),
        category: category || 'Other',
        labels,
        value: formatValue(baseName, rawValue),
      }
    })
}

function MetricsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [rows, setRows] = useState([])

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/actuator/prometheus', { responseType: 'text' })
        setRows(parsePrometheus(response.data || ''))
      } catch {
        setRows([])
        setError('Unable to load metrics from backend.')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const categories = useMemo(() => ['All', ...new Set(rows.map((row) => row.category))], [rows])

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesCategory = category === 'All' || row.category === category
      if (!matchesCategory) return false
      if (!search) return true

      const labelsText = row.labels.map((label) => `${label.key}:${label.value}`).join(' ').toLowerCase()
      return (
        row.displayName.toLowerCase().includes(search) ||
        row.rawName.toLowerCase().includes(search) ||
        labelsText.includes(search)
      )
    })
  }, [rows, query, category])

  if (loading) return <LoadingSpinner label="Loading metrics..." />

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Showing {filteredRows.length} metrics
        </div>
        <div className="flex w-full max-w-2xl flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search metric name or labels"
            className="min-w-[16rem] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="max-h-[calc(100vh-14rem)] overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/90">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Metric</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Category</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Labels</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-3 py-2">
                  <div className="font-medium">{row.displayName}</div>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.rawName}</div>
                </td>
                <td className="px-3 py-2">{row.category}</td>
                <td className="px-3 py-2">
                  {!row.labels.length ? (
                    <span className="text-slate-500 dark:text-slate-400">-</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {row.labels.map((label) => (
                        <span key={`${row.id}-${label.key}`} className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800">
                          {label.key}: {label.value}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{row.value}</td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                  No metrics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default MetricsPage
