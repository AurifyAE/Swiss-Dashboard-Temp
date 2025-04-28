import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Define the Firebase configuration object with appropriate types
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Define the VAPID key as a constant string
const vapidKey = import.meta.env.VITE_VAPID_KEY;

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get messaging instance from Firebase
const messaging = getMessaging(app);

// Function to request FCM token
export const requestFCMToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Get the FCM token using the VAPID key
            return getToken(messaging, { vapidKey });
        } else {
            throw new Error('Notification permission not granted');
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        throw error;
    }
};