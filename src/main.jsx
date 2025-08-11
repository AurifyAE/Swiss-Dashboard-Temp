import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ServerError from './components/500.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotificationHandler from './utils/notificationHandler.js'; // Adjust path as needed

// Initialize notifications when the app loads
const initializeApp = async () => {
  try {
    console.log('🚀 Starting app initialization...');
    
    // Initialize notifications
    await NotificationHandler.initializeNotifications();
    console.log('✅ Notifications initialized');
    
    // Render the app
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary fallback={<ServerError />}>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    
    // Still render the app even if notifications fail
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary fallback={<ServerError />}>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  }
};

// Start the app
initializeApp();