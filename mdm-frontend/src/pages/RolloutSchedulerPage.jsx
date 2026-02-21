import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const initialForm = {
  fromVersion: '',
  toVersion: '',
  region: '',
  customizationTag: '',
  deviceGroup: '',
  scheduledTime: '',
  rolloutType: 'IMMEDIATE',
  batchPercentage: 100,
  rollbackScope: 'FAILED_ONLY',
  maxRetries: 2,
  retryBackoffMinutes: 10,
}

function RolloutSchedulerPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [versions, setVersions] = useState([])
  const [schedules, setSchedules] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [confirmState, setConfirmState] = useState({ open: false, action: null, scheduleId: null })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [versionRes, scheduleRes] = await Promise.all([
        api.get('/api/version').catch(() => ({ data: [] })),
        api.get('/api/schedule').catch(() => ({ data: [] })),
      ])
      setVersions(Array.isArray(versionRes.data) ? versionRes.data : versionRes.data?.content || [])
      setSchedules(Array.isArray(scheduleRes.data) ? scheduleRes.data : scheduleRes.data?.content || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const versionOptions = useMemo(() => versions.map((version) => version.versionCode || version.versionName).filter(Boolean), [versions])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/schedule', {
        ...formData,
        batchPercentage: Number(formData.batchPercentage),
        maxRetries: Number(formData.maxRetries),
        retryBackoffMinutes: Number(formData.retryBackoffMinutes),
        scheduledTime: formData.scheduledTime || null,
      })
      toast.success('Rollout scheduled successfully')
      setFormData(initialForm)
      await fetchData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create rollout schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const openActionConfirm = (action, scheduleId) => setConfirmState({ open: true, action, scheduleId })
  const closeActionConfirm = () => setConfirmState({ open: false, action: null, scheduleId: null })

  const executeAction = async () => {
    if (!confirmState.scheduleId || !confirmState.action) return

    let endpoint = confirmState.action === 'next' ? `/api/rollout/${confirmState.scheduleId}/next` : `/api/rollout/${confirmState.scheduleId}/retry`
    if (confirmState.action === 'approve') endpoint = `/api/schedule/${confirmState.scheduleId}/approve`
    if (confirmState.action === 'reject') endpoint = `/api/schedule/${confirmState.scheduleId}/reject`

    setActionLoading(true)
    try {
      await api.post(endpoint)
      toast.success(
        confirmState.action === 'next'
          ? 'Moved to next phase'
          : confirmState.action === 'retry'
            ? 'Retry initiated'
            : confirmState.action === 'approve'
              ? 'Schedule approved'
              : 'Schedule rejected',
      )
      closeActionConfirm()
      await fetchData()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Schedule Rollout</h3>
        <div className="mt-4 space-y-3">
          <SelectField label="From Version" name="fromVersion" value={formData.fromVersion} onChange={handleChange} options={versionOptions} />
          <SelectField label="To Version" name="toVersion" value={formData.toVersion} onChange={handleChange} options={versionOptions} />
          <InputField label="Region" name="region" value={formData.region} onChange={handleChange} required />
          <InputField label="Customization Tag" name="customizationTag" value={formData.customizationTag} onChange={handleChange} />
          <InputField label="Device Group" name="deviceGroup" value={formData.deviceGroup} onChange={handleChange} />
          <InputField label="Scheduled Time" name="scheduledTime" type="datetime-local" value={formData.scheduledTime} onChange={handleChange} />
          <SelectField label="Rollout Type" name="rolloutType" value={formData.rolloutType} onChange={handleChange} options={['IMMEDIATE', 'PHASED']} />
          <InputField label="Batch Percentage" name="batchPercentage" type="number" min="1" max="100" value={formData.batchPercentage} onChange={handleChange} required />
          <InputField label="Max Retries" name="maxRetries" type="number" min="0" max="10" value={formData.maxRetries} onChange={handleChange} required />
          <InputField label="Retry Backoff (min)" name="retryBackoffMinutes" type="number" min="1" max="1440" value={formData.retryBackoffMinutes} onChange={handleChange} required />
          <SelectField label="Rollback Scope" name="rollbackScope" value={formData.rollbackScope} onChange={handleChange} options={['FAILED_ONLY', 'FULL']} />
        </div>
        <button type="submit" disabled={submitting} className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          {submitting ? 'Scheduling...' : 'Create Schedule'}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Rollout List</h3>

        {loading ? (
          <div className="mt-4"><LoadingSpinner label="Loading rollout schedules..." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Schedule ID', 'From -> To', 'Region', 'Batch %', 'Status', 'Failure %', 'Actions'].map((head) => (
                    <th key={head} className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => (
                  <tr key={schedule.id || schedule.scheduleId || index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{schedule.id || schedule.scheduleId || '-'}</td>
                    <td className="px-3 py-2">{(schedule.fromVersion || '-') + ' -> ' + (schedule.toVersion || '-')}</td>
                    <td className="px-3 py-2">{schedule.region || '-'}</td>
                    <td className="px-3 py-2">{schedule.batchPercentage ?? '-'}</td>
                    <td className="px-3 py-2">{schedule.status || '-'}</td>
                    <td className="px-3 py-2">{schedule.failurePercentage ?? '-'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openActionConfirm('next', schedule.id || schedule.scheduleId)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Next Phase</button>
                        <button onClick={() => openActionConfirm('retry', schedule.id || schedule.scheduleId)} className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950">Retry Failed</button>
                        {schedule.status === 'PENDING_APPROVAL' && (
                          <>
                            <button onClick={() => openActionConfirm('approve', schedule.id || schedule.scheduleId)} className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">Approve</button>
                            <button onClick={() => openActionConfirm('reject', schedule.id || schedule.scheduleId)} className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50">Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!schedules.length && (
                  <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>No rollout schedules available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={
          confirmState.action === 'next'
            ? 'Proceed to next phase?'
            : confirmState.action === 'retry'
              ? 'Retry failed devices?'
              : confirmState.action === 'approve'
                ? 'Approve schedule?'
                : 'Reject schedule?'
        }
        message={
          confirmState.action === 'next'
            ? 'This will move the rollout to the next phase for the selected schedule.'
            : confirmState.action === 'retry'
              ? 'This will retry rollout for devices that previously failed.'
              : confirmState.action === 'approve'
                ? 'This will approve and activate the schedule.'
                : 'This will reject the schedule.'
        }
        confirmText={
          confirmState.action === 'next'
            ? 'Proceed'
            : confirmState.action === 'retry'
              ? 'Retry'
              : confirmState.action === 'approve'
                ? 'Approve'
                : 'Reject'
        }
        onConfirm={executeAction}
        onCancel={closeActionConfirm}
        loading={actionLoading}
      />
    </section>
  )
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800" {...props} />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <select name={name} value={value} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-purple-500 focus:ring-2 dark:border-slate-600 dark:bg-slate-800">
        <option value="">Select option</option>
        {options.map((option) => (<option key={option} value={option}>{option}</option>))}
      </select>
    </div>
  )
}

export default RolloutSchedulerPage
