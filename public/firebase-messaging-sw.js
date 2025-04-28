importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js')
// Initialize the Firebase app in the service worker by passing the config object
const firebaseConfig = {
    apiKey: 'AIzaSyCAHapnxRWqH8lwgYuFjrHQ7rDrkRlSe54',
    authDomain: 'pushnotifaction-11aab.firebaseapp.com',
    projectId: 'pushnotifaction-11aab',
    storageBucket: 'pushnotifaction-11aab.appspot.com',
    messagingSenderId: '329227476273',
    appId: '1:329227476273:web:d977025db3317cafeee410',
    measurementId: 'G-LB4BB5PSG5',
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});