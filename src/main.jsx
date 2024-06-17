import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider>
    <HashRouter>
      <App />
    </HashRouter>
    </CookiesProvider>
  </React.StrictMode>,
)
