import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

const initialForm = {
  imei: '',
  appVersion: '',
  os: '',
  model: '',
  region: '',
  customizationTag: '',
  deviceGroup: '',
}

function AddDevicePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/device', formData)
      toast.success('Device added successfully')
      setFormData(initialForm)
      navigate('/devices')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add device')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-3xl">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-base font-semibold">Add Device</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Register a device manually in inventory.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InputField label="IMEI" name="imei" value={formData.imei} onChange={handleChange} required />
          <InputField label="App Version" name="appVersion" value={formData.appVersion} onChange={handleChange} required />
          <InputField label="OS" name="os" value={formData.os} onChange={handleChange} required />
          <InputField label="Model" name="model" value={formData.model} onChange={handleChange} />
          <InputField label="Region" name="region" value={formData.region} onChange={handleChange} required />
          <InputField label="Customization Tag" name="customizationTag" value={formData.customizationTag} onChange={handleChange} />
          <InputField label="Device Group" name="deviceGroup" value={formData.deviceGroup} onChange={handleChange} />
        </div>
        <button type="submit" disabled={submitting} className="interactive-surface mt-5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-500 hover:to-violet-500 disabled:opacity-60">
          {submitting ? 'Adding...' : 'Add Device'}
        </button>
      </form>
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

export default AddDevicePage
