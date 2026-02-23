import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'

const initialForm = {
  fromVersion: '',
  toVersion: '',
  requiresIntermediate: false,
  intermediateVersion: '',
  notes: '',
}

function CompatibilityPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [versions, setVersions] = useState([])
  const [rows, setRows] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [versionRes, compatibilityRes] = await Promise.all([
        api.get('/api/version').catch(() => ({ data: [] })),
        api.get('/api/compatibility'),
      ])
      setVersions(Array.isArray(versionRes.data) ? versionRes.data : versionRes.data?.content || [])
      setRows(Array.isArray(compatibilityRes.data) ? compatibilityRes.data : compatibilityRes.data?.content || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, pageSize, rows.length])

  const versionOptions = useMemo(() => versions.map((version) => version.versionCode || version.versionName).filter(Boolean), [versions])
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => {
    setFormData(initialForm)
    setEditingId(null)
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setFormData({
      fromVersion: entry.fromVersion || '',
      toVersion: entry.toVersion || '',
      requiresIntermediate: Boolean(entry.requiresIntermediate),
      intermediateVersion: entry.intermediateVersion || '',
      notes: entry.notes || '',
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/api/compatibility/${editingId}`, formData)
        toast.success('Compatibility rule updated')
      } else {
        await api.post('/api/compatibility', formData)
        toast.success('Compatibility rule created')
      }
      resetForm()
      await fetchData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not save compatibility rule')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/compatibility/${id}`)
      toast.success('Compatibility rule deleted')
      await fetchData()
    } catch {
      toast.error('Delete endpoint unavailable or request failed')
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Create / Update Rule</h3>
        <div className="mt-4 space-y-3">
          <SelectField label="From Version" name="fromVersion" value={formData.fromVersion} onChange={handleChange} options={versionOptions} />
          <SelectField label="To Version" name="toVersion" value={formData.toVersion} onChange={handleChange} options={versionOptions} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requiresIntermediate" checked={formData.requiresIntermediate} onChange={handleChange} />Requires Intermediate</label>
          <SelectField label="Intermediate Version" name="intermediateVersion" value={formData.intermediateVersion} onChange={handleChange} options={versionOptions} />
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800" />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
            {submitting ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Cancel Edit</button>}
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Compatibility Matrix</h3>

        {loading ? (
          <div className="mt-4"><LoadingSpinner label="Loading compatibility matrix..." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['From', 'To', 'Requires Intermediate', 'Intermediate', 'Notes', 'Actions'].map((head) => (
                    <th key={head} className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, index) => (
                  <tr key={row.id || index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{row.fromVersion || '-'}</td>
                    <td className="px-3 py-2">{row.toVersion || '-'}</td>
                    <td className="px-3 py-2">{row.requiresIntermediate ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">{row.intermediateVersion || '-'}</td>
                    <td className="px-3 py-2">{row.notes || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(row)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Edit</button>
                        <button onClick={() => row.id && handleDelete(row.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>No compatibility rules defined.</td></tr>
                )}
              </tbody>
            </table>
            <Pagination
              totalItems={rows.length}
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
      </div>
    </section>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800">
        <option value="">Select version</option>
        {options.map((option) => (<option key={option} value={option}>{option}</option>))}
      </select>
    </div>
  )
}

export default CompatibilityPage
