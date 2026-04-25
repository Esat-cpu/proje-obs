import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' /* index.css projenin global stil dosyasıdır */
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'/* BrowserRouter, yonlendirmeyi saglayan ana sarmalayicidir */
import './i18n/i18n'

createRoot(document.getElementById('root')).render(
/* React, HTML'deki root kutusunu bulur. Hata ayıklama modunu (StrictMode) ve yönlendirme sistemini (BrowserRouter) açar.
    Son olarak tüm uygulamayı (<App />) alıp o kutunun içine çizerek projeyi başlatır.*/
<StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</StrictMode>
)
