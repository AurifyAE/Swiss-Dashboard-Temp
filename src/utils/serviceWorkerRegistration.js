export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then(function (registration) {
            })
            .catch(function (error) {
                console.log('Service Worker registration failed:', error);
            });
    }
};