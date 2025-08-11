// notificationHandler.js - Updated for dynamic config
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_VAPID_KEY;

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

class NotificationHandler {
  static async requestPermission() {
    console.log('🔔 Requesting notification permission...');
    
    try {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.warn('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker not supported');
      return null;
    }

    try {
      console.log('🔧 Registering service worker...');
      
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );
      
      console.log('✅ Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      // Send Firebase config to service worker
      await this.sendConfigToServiceWorker(registration);
      
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  static async sendConfigToServiceWorker(registration) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'FIREBASE_INITIALIZED') {
          if (event.data.success) {
            console.log('✅ Firebase initialized in service worker');
            resolve();
          } else {
            console.error('❌ Firebase initialization failed in service worker:', event.data.error);
            reject(new Error(event.data.error));
          }
        }
      };

      // Send config to service worker
      if (registration.active) {
        registration.active.postMessage(
          { 
            type: 'INIT_FIREBASE', 
            config: firebaseConfig 
          },
          [messageChannel.port2]
        );
      } else {
        reject(new Error('Service worker not active'));
      }
    });
  }

  static async getFCMToken() {
    try {
      // First request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission not granted');
      }

      // Register service worker
      const registration = await this.registerServiceWorker();
      if (!registration) {
        throw new Error('Service Worker registration failed');
      }

      console.log('🔑 Getting FCM token...');
      
      // Get FCM token
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration 
      });
      
      if (token) {
        console.log('✅ FCM Token generated:', token.substring(0, 50) + '...');
        return token;
      } else {
        throw new Error('No registration token available');
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      throw error;
    }
  }

  static setupForegroundMessageListener() {
    console.log('👂 Setting up foreground message listener...');
    
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      
      // Extract notification data
      const notificationTitle = 
        payload.notification?.title || 
        payload.data?.title || 
        'New Notification';
        
      const notificationBody = 
        payload.notification?.body || 
        payload.data?.body || 
        'You have a new message';

      const data = payload.data || {};
      const adminLogo = 
        data.adminLogo || 
        data.admin_logo_url || 
        'https://aurifyimage.s3.ap-south-1.amazonaws.com/1744013531086-swiss.webp';

      // Show notification when app is in foreground
      if (Notification.permission === 'granted') {
        const notification = new Notification(notificationTitle, {
          body: notificationBody,
          icon: adminLogo,
          badge: adminLogo,
          tag: `aurify_${data.orderId || Date.now()}`,
          requireInteraction: true,
          data: {
            url: data.redirectUrl || data.url || 'https://aurify.ae/orders',
            ...data
          }
        });

        notification.onclick = (event) => {
          event.preventDefault();
          const url = notification.data.url || 'https://aurify.ae/orders';
          window.open(url, '_blank');
          notification.close();
        };

        // Auto close after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    });
  }

  static async initializeNotifications() {
    try {
      console.log('🚀 Initializing notifications...');
      
      // Get FCM token
      const token = await this.getFCMToken();
      
      // Setup foreground message listener
      this.setupForegroundMessageListener();
      
      console.log('✅ Notifications initialized successfully');
      return token;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      throw error;
    }
  }

  // Test function to verify web notifications work
  static async testWebNotification() {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        alert('Please enable notifications in your browser settings');
        return;
      }

      // Show a test notification
      const notification = new Notification('🧪 Test Notification', {
        body: 'Web notifications are working correctly!',
        icon: 'https://aurifyimage.s3.ap-south-1.amazonaws.com/1744013531086-swiss.webp',
        badge: 'https://aurifyimage.s3.ap-south-1.amazonaws.com/1744013531086-swiss.webp',
        requireInteraction: true,
        tag: 'test-notification'
      });

      notification.onclick = () => {
        console.log('Test notification clicked');
        notification.close();
      };

      console.log('✅ Test notification shown');
    } catch (error) {
      console.error('❌ Test notification failed:', error);
    }
  }
}

export default NotificationHandler;