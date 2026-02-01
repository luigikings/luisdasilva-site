import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { InterviewExperience } from './pages/InterviewExperience'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterviewExperience />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
