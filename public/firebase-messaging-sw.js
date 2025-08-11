// firebase-messaging-sw.js - Dynamic version
importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js"
);

let messaging = null;

// Listen for config from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    console.log("🔥 Initializing Firebase in service worker with config");

    const firebaseConfig = event.data.config;

    try {
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      messaging = firebase.messaging();

      // Handle background messages
      messaging.onBackgroundMessage((payload) => {
        console.log(
          "[firebase-messaging-sw.js] Received background message:",
          payload
        );

        const notificationTitle =
          payload.notification?.title ||
          payload.data?.title ||
          "New Notification";

        const notificationBody =
          payload.notification?.body ||
          payload.data?.body ||
          "You have a new message";

        const data = payload.data || {};
        const adminLogo =
          data.adminLogo ||
          data.admin_logo_url ||
          "https://aurifyimage.s3.ap-south-1.amazonaws.com/1744013531086-swiss.webp";

        const redirectUrl =
          data.redirectUrl || data.url || "https://aurify.ae/orders";

        const uniqueTag = `aurify_${data.orderId || data.transactionId || Date.now()}`;

        const notificationOptions = {
          body: notificationBody,
          icon: adminLogo,
          badge: adminLogo,
          tag: uniqueTag,
          renotify: true,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200],
          actions: [
            {
              action: "view_order",
              title: "View Order",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
          data: {
            url: redirectUrl,
            orderId: data.orderId || "",
            transactionId: data.transactionId || "",
            type: data.type || "default",
            adminLogo: adminLogo,
            ...data,
          },
        };

        return self.registration.showNotification(
          notificationTitle,
          notificationOptions
        );
      });

      // Send success message back
      event.ports[0].postMessage({
        type: "FIREBASE_INITIALIZED",
        success: true,
      });
    } catch (error) {
      console.error("❌ Error initializing Firebase in service worker:", error);
      event.ports[0].postMessage({
        type: "FIREBASE_INITIALIZED",
        success: false,
        error: error.message,
      });
    }
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  let urlToOpen = data.url || "https://aurify.ae/orders";

  if (action === "view_order" && data.orderId) {
    urlToOpen = `https://aurify.ae/orders/${data.orderId}`;
  } else if (action === "dismiss") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("aurify.ae") && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
