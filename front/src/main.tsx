import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' 
import './index.css'        

// ReactDOM.createRoot busca el elemento en el index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {}
  </React.StrictMode>,
)