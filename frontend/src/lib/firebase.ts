// // import { initializeApp } from "firebase/app";
// // import { getMessaging, getToken, onMessage ,Messaging} from "firebase/messaging";

// // const firebaseConfig = {
// //   apiKey: "AIzaSyCqc8Xe5NPqCQ_tOwep8apM5hJCkifXSZ0",
// //   authDomain: "newceyagro.firebaseapp.com",
// //   projectId: "newceyagro",
// //   storageBucket: "newceyagro.firebasestorage.app",
// //   messagingSenderId: "7782577773",
// //   appId: "1:7782577773:web:6486d8ceedf9dde303b164",
// // };

// // const app = initializeApp(firebaseConfig);
// // export const messaging = getMessaging(app);

// // export const requestNotificationPermission = async (
// //   vapidKey: string
// // ): Promise<string | null> => {
// //   try {
// //     console.log("Requesting notification permission...");
// //     const permission = await Notification.requestPermission();
// //     if (permission === "granted") {
// //       console.log("Notification permission granted.");
// //       console.log("Fetching FCM token with VAPID key:", vapidKey);
// //       const token = await getToken(messaging, { vapidKey });
// //       console.log("FCM Token:", token);
// //       return token;
// //     } else {
// //       console.log("Notification permission denied.");
// //       return null;
// //     }
// //   } catch (error) {
// //     console.error("Error requesting notification permission:", error);
// //     return null;
// //   }
// // };

// // export const onMessageListener = () =>
// //   new Promise((resolve) => {
// //     onMessage(messaging, (payload) => {
// //       console.log("Foreground message received:", payload);
// //       resolve(payload);
// //     });
// //   });




// // import { initializeApp } from "firebase/app";
// // import {
// //   getMessaging,
// //   getToken,
// //   onMessage,
// //   Messaging,
// // } from "firebase/messaging";

// // const firebaseConfig = {
// //   apiKey: "AIzaSyCqc8Xe5NPqCQ_tOwep8apM5hJCkifXSZ0",
// //   authDomain: "newceyagro.firebaseapp.com",
// //   projectId: "newceyagro",
// //   storageBucket: "newceyagro.firebasestorage.app",
// //   messagingSenderId: "7782577773",
// //   appId: "1:7782577773:web:6486d8ceedf9dde303b164",
// // };

// // const app = initializeApp(firebaseConfig);

// // // Initialize messaging only in the browser
// // export let messaging: Messaging | null = null;
// // if (typeof window !== "undefined") {
// //   try {
// //     messaging = getMessaging(app);
// //   } catch (error) {
// //     console.error("Error initializing Firebase Messaging:", error);
// //   }
// // }

// // export const requestNotificationPermission = async (
// //   vapidKey: string
// // ): Promise<string | null> => {
// //   if (typeof window === "undefined" || !messaging) {
// //     console.log("Messaging not available in this environment");
// //     return null;
// //   }
// //   try {
// //     console.log("Requesting notification permission...");
// //     const permission = await Notification.requestPermission();
// //     if (permission === "granted") {
// //       console.log("Notification permission granted.");
// //       console.log("Fetching FCM token with VAPID key:", vapidKey);
// //       const token = await getToken(messaging, { vapidKey });
// //       console.log("FCM Token:", token);
// //       return token;
// //     } else {
// //       console.log("Notification permission denied.");
// //       return null;
// //     }
// //   } catch (error) {
// //     console.error("Error requesting notification permission:", error);
// //     return null;
// //   }
// // };

// // export const onMessageListener = () =>
// //   new Promise((resolve) => {
// //     if (typeof window === "undefined" || !messaging) {
// //       console.log("Messaging not available in this environment");
// //       return;
// //     }
// //     onMessage(messaging, (payload) => {
// //       console.log("Foreground message received:", payload);
// //       resolve(payload);
// //     });
// //   });















// import { initializeApp } from "firebase/app";
// import {
//   getMessaging,
//   getToken,
//   onMessage,
//   Messaging,
// } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: "AIzaSyCqc8Xe5NPqCQ_tOwep8apM5hJCkifXSZ0",
//   authDomain: "newceyagro.firebaseapp.com",
//   projectId: "newceyagro",
//   storageBucket: "newceyagro.firebasestorage.app",
//   messagingSenderId: "7782577773",
//   appId: "1:7782577773:web:6486d8ceedf9dde303b164",
// };

// const app = initializeApp(firebaseConfig);

// export let messaging: Messaging | null = null;
// if (typeof window !== "undefined" && "serviceWorker" in navigator) {
//   try {
//     messaging = getMessaging(app);
//     console.log("Firebase Messaging initialized successfully");
//   } catch (error) {
//     console.error("Failed to initialize Firebase Messaging:", error);
//   }
// }

// export const requestNotificationPermission = async (
//   vapidKey: string
// ): Promise<string | null> => {
//   if (!messaging || typeof window === "undefined") {
//     console.error("Messaging not available or not running in browser environment");
//     return null;
//   }

//   try {
//     console.log("Requesting notification permission...");
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       console.log("Notification permission granted");
//       const token = await getToken(messaging, { vapidKey });
//       if (token) {
//         console.log("FCM Token generated:", token);
//         return token;
//       } else {
//         console.error("No FCM token returned");
//         return null;
//       }
//     } else {
//       console.warn("Notification permission denied by user");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error generating FCM token:", error);
//     return null;
//   }
// };

// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     if (!messaging || typeof window === "undefined") {
//       console.error("Messaging not available in this environment");
//       return;
//     }
//     onMessage(messaging, (payload) => {
//       console.log("Foreground message received:", payload);
//       resolve(payload);
//     });
//   });









// lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCqc8Xe5NPqCQ_tOwep8apM5hJCkifXSZ0",
  authDomain: "newceyagro.firebaseapp.com",
  projectId: "newceyagro",
  storageBucket: "newceyagro.firebasestorage.app",
  messagingSenderId: "7782577773",
  appId: "1:7782577773:web:6486d8ceedf9dde303b164",
};

const app = initializeApp(firebaseConfig);

export let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
    console.log("Firebase Messaging initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Messaging:", error);
  }
}

export const requestNotificationPermission = async (
  vapidKey: string
): Promise<string | null> => {
  if (!messaging || typeof window === "undefined") {
    console.error("Messaging not available or not running in browser environment");
    return null;
  }

  try {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        console.log("FCM Token generated:", token);
        return token;
      } else {
        console.warn("No FCM token returned. Ensure service worker is registered and VAPID key is correct.");
        return null;
      }
    } else {
      console.warn("Notification permission denied by user");
      return null;
    }
  } catch (error) {
    console.error("Error generating FCM token:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging || typeof window === "undefined") {
      console.error("Messaging not available in this environment");
      return;
    }
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });