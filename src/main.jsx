import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.pcss'
import App from "./App.jsx";
import { store } from '../src/redux/store.js'
import { Provider } from 'react-redux'
import './i18n';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
