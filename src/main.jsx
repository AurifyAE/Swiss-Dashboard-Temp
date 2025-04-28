import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ServerError from './components/500.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
 
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <ErrorBoundary fallback={<ServerError />}>
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
