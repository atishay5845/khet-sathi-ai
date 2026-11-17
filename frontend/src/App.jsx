import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import Dashboard from './pages/Dashboard'
import NewAdvisory from './pages/NewAdvisory'
import AdvisoryReport from './pages/AdvisoryReport'
import Market from './pages/Market'
import Schemes from './pages/Schemes'
import History from './pages/History'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="/new-advisory" element={<NewAdvisory />} />
        <Route path="/advisory/:id" element={<AdvisoryReport />} />
        <Route path="/market" element={<Market />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
