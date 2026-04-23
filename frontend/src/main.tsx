import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import './index.css'
import { LanguageProvider } from './hooks/useT'

const rootElement = document.getElementById('root')

// Guard: index.html must include <div id="root">
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* LanguageProvider wraps the whole tree so any component can call useT() */}
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)