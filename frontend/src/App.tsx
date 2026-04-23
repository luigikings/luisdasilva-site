import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { InterviewExperience } from './pages/InterviewExperience'

/** Single-page app — all traffic goes to InterviewExperience; unknown paths redirect to root */
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