import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SuperAdminApp from './SuperAdminApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SuperAdminApp />
  </StrictMode>,
)
