import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { InterviewExperience } from './pages/InterviewExperience'
import { AdminApp } from './pages/admin/AdminApp'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterviewExperience />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
