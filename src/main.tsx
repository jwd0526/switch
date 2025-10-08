import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { Analytics } from "@vercel/analytics/react"


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics mode="production" />;
    <App />
  </React.StrictMode>,
)