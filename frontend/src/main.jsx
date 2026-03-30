import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* COMPONENTS */
import App from '@/App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ConfigProvider } from '@/context/ConfigContext.jsx'

/* CSS */
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '@/css/index.css'
import { SearchProvider } from './context/SearchContext'
import { ErrorProvider } from './context/ErrorContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider>
      <ThemeProvider>
        <ErrorProvider>
          <BrowserRouter>
            <SearchProvider>
              <App />
            </SearchProvider>
          </BrowserRouter>
        </ErrorProvider>
      </ThemeProvider>
    </ConfigProvider>
  </StrictMode>
)