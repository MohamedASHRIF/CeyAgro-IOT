importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCqc8Xe5NPqCQ_tOwep8apM5hJCkifXSZ0",
  authDomain: "newceyagro.firebaseapp.com",
  projectId: "newceyagro",
  storageBucket: "newceyagro.firebasestorage.app",
  messagingSenderId: "7782577773",
  appId: "1:7782577773:web:6486d8ceedf9dde303b164",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification.",
    icon: "/favicon.ico", // Optional: Add your app’s icon
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listen for token refresh in the service worker
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Push subscription changed");
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: "YOUR_PUBLIC_VAPID_KEY", // Base64-encoded VAPID key
      })
      .then((subscription) => {
        console.log("New push subscription:", subscription);
        // Notify the frontend to refresh the token
        self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "TOKEN_REFRESH" });
          });
        });
      })
      .catch((error) => {
        console.error("Error refreshing push subscription:", error);
      })
  );
});
