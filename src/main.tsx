import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.scss'
import "./styles/globals.scss"
import "./styles/fonts.scss"
import App from './App.tsx'
import RootLayout from './pages/layout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
