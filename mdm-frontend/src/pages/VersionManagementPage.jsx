import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'

const initialForm = {
  versionCode: '',
  versionName: '',
  mandatory: false,
  supportedOs: '',
  customizationTag: '',
}

function VersionManagementPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [versions, setVersions] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [mandatoryFilter, setMandatoryFilter] = useState('all')

  const fetchVersions = useCallback(async (currentPage = page, currentPageSize = pageSize, currentSearch = search, currentMandatory = mandatoryFilter) => {
    setLoading(true)
    try {
      const params = {
        page: currentPage - 1,
        size: currentPageSize,
        sortBy: 'releaseDate',
        sortDir: 'desc',
      }
      if (currentSearch.trim()) {
        params.search = currentSearch.trim()
      }
      if (currentMandatory !== 'all') {
        params.mandatory = currentMandatory === 'true'
      }
      const response = await api.get('/api/version', { params })
      if (Array.isArray(response.data)) {
        setVersions(response.data)
        setTotalItems(response.data.length)
        return
      }
      setVersions(Array.isArray(response.data?.content) ? response.data.content : [])
      setTotalItems(response.data?.totalElements ?? 0)
    } catch {
      setVersions([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [mandatoryFilter, page, pageSize, search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchVersions(page, pageSize, search, mandatoryFilter)
    }, 250)
    return () => clearTimeout(timeout)
  }, [fetchVersions, page, pageSize, search, mandatoryFilter])

  useEffect(() => {
    setPage(1)
  }, [search, mandatoryFilter])

  const paginatedVersions = useMemo(() => versions, [versions])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/version', formData)
      toast.success('Version created successfully')
      setFormData(initialForm)
      await fetchVersions()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create version')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Create App Version</h3>
        <div className="mt-4 space-y-3">
          <InputField label="Version Code" name="versionCode" value={formData.versionCode} onChange={handleChange} required />
          <InputField label="Version Name" name="versionName" value={formData.versionName} onChange={handleChange} required />
          <InputField label="Supported OS" name="supportedOs" value={formData.supportedOs} onChange={handleChange} required />
          <InputField label="Customization Tag" name="customizationTag" value={formData.customizationTag} onChange={handleChange} required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="mandatory" checked={formData.mandatory} onChange={handleChange} />
            Mandatory Update
          </label>
        </div>
        <button type="submit" disabled={submitting} className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          {submitting ? 'Saving...' : 'Create Version'}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Version List</h3>
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code, name, OS"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          />
          <select
            value={mandatoryFilter}
            onChange={(event) => setMandatoryFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="all">All Types</option>
            <option value="true">Mandatory</option>
            <option value="false">Optional</option>
          </select>
        </div>
        {loading ? (
          <div className="mt-4"><LoadingSpinner label="Loading versions..." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Code', 'Name', 'Mandatory', 'Supported OS', 'Tag'].map((head) => (
                    <th key={head} className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedVersions.map((version, index) => (
                  <tr key={version.id || version.versionCode || index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{version.versionCode || '-'}</td>
                    <td className="px-3 py-2">{version.versionName || '-'}</td>
                    <td className="px-3 py-2">{version.mandatory ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">{version.supportedOs || '-'}</td>
                    <td className="px-3 py-2">{version.customizationTag || '-'}</td>
                  </tr>
                ))}
                {!versions.length && (
                  <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>No versions available.</td></tr>
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
      </div>
    </section>
  )
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800" {...props} />
    </div>
  )
}

export default VersionManagementPage
