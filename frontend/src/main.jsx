import { createRoot } from 'react-dom/client'
import AppContextProvider from './context/AppContextProvider.jsx'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>

  </BrowserRouter>,
)
