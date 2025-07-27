import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FlexivoPortfolio from './flexivo-portfolio.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlexivoPortfolio />
  </StrictMode>,
)
