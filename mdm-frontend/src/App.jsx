import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import AuditLogsPage from './pages/AuditLogsPage'
import AddDevicePage from './pages/AddDevicePage'
import CompatibilityPage from './pages/CompatibilityPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import DeviceTimelinePage from './pages/DeviceTimelinePage'
import LoginPage from './pages/LoginPage'
import MetricsPage from './pages/MetricsPage'
import NotFoundPage from './pages/NotFoundPage'
import RolloutMonitoringPage from './pages/RolloutMonitoringPage'
import RolloutSchedulerPage from './pages/RolloutSchedulerPage'
import VersionManagementPage from './pages/VersionManagementPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/add" element={<AddDevicePage />} />
          <Route path="/device-timeline" element={<DeviceTimelinePage />} />
          <Route path="/versions" element={<VersionManagementPage />} />
          <Route path="/compatibility" element={<CompatibilityPage />} />
          <Route path="/rollout/scheduler" element={<RolloutSchedulerPage />} />
          <Route path="/rollout/monitoring" element={<RolloutMonitoringPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
