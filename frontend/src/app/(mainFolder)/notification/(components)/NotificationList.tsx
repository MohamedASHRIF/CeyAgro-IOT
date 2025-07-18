// "use client";
// import { useState, useEffect, useRef } from "react";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";
// import {
//   messaging,
//   requestNotificationPermission,
//   onMessageListener,
// } from "../../../../lib/firebase";
// import { getToken } from "firebase/messaging";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [fcmToken, setFcmToken] = useState<string | null>(null);
//   const userId = "user123";
//   const socketRef = useRef<Socket | null>(null);
//   const vapidKey =
//     "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";

//   //fetch existing notifications
//   const fetchNotifications = async () => {
//     try {
//       console.log("Fetching notifications for user:", userId);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${userId}`
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("Notifications fetched:", data);
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   //Sending FCM Token to Backend
//   const sendFcmTokenToBackend = async (token: string) => {
//     try {
//       console.log("Sending FCM token to backend:", token);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/fcm-token`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ fcmToken: token }),
//         }
//       );
//       const result = await response.json();
//       console.log("Backend response:", result);
//       setFcmToken(token);
//     } catch (error) {
//       console.error("Error sending FCM token to backend:", error);
//     }
//   };

//   //monitior token refresh
//   const checkTokenRefresh = async () => {
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission === "granted" && messaging) {
//         const newToken = await getToken(messaging, { vapidKey });
//         if (newToken !== fcmToken && newToken) {
//           console.log("FCM token changed:", newToken);
//           sendFcmTokenToBackend(newToken);
//         }
//       }
//     } catch (error) {
//       console.error("Error checking FCM token:", error);
//     }
//   };

//   //fetch notifications once
//   useEffect(() => {
//     fetchNotifications();
//   }, [userId]);

//   useEffect(() => {
//     // Request initial notification permission and get FCM token
//     requestNotificationPermission(vapidKey).then((token) => {
//       if (token) {
//         sendFcmTokenToBackend(token);
//       }
//     });

//     // Periodically check for token refresh
//     const tokenCheckInterval = setInterval(checkTokenRefresh, 1 * 60 * 1000);

//     // Handle service worker messages for token refresh
//     const handleServiceWorkerMessage = (event: MessageEvent) => {
//       if (event.data && event.data.type === "TOKEN_REFRESH") {
//         console.log("Received TOKEN_REFRESH from service worker");
//         checkTokenRefresh();
//       }
//     };
//     navigator.serviceWorker.addEventListener(
//       "message",
//       handleServiceWorkerMessage
//     );

//     // Handle foreground notifications
//     onMessageListener().then((payload: any) => {
//       const notification = {
//         id: new Date().toISOString(),
//         title: payload.notification?.title || "New Notification",
//         message: payload.notification?.body || "You have a new notification.",
//         userId,
//         timestamp: new Date().toISOString(),
//       };
//       setNotifications((prev) => {
//         if (prev.some((n) => n.message === notification.message)) {
//           return prev;
//         }
//         return [notification, ...prev];
//       });
//     });

//     // WebSocket setup
//     console.log("Establishing WebSocket connection");
//     socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       console.log("WebSocket connected:", socket.id);
//       socket.emit("join", userId);
//     });

//     socket.on("notification", (notification: Notification) => {
//       console.log("Received WebSocket notification:", notification);
//       if (notification.userId === userId) {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.id === notification.id)) {
//             console.log("Duplicate notification ignored:", notification.id);
//             return prev;
//           }
//           return [notification, ...prev];
//         });
//       }
//     });

//     socket.on("notificationDeleted", (id: string) => {
//       console.log("Received notificationDeleted:", id);
//       setNotifications((prev) =>
//         prev.filter((notification) => notification.id !== id)
//       );
//     });

//     socket.on("disconnect", () => {
//       console.log("WebSocket disconnected");
//     });

//     return () => {
//       console.log("Cleaning up WebSocket connection");
//       socket.disconnect();
//       socketRef.current = null;
//       clearInterval(tokenCheckInterval);
//       navigator.serviceWorker.removeEventListener(
//         "message",
//         handleServiceWorkerMessage
//       );
//     };
//   }, [userId]);

//   return (
//     <div className="space-y-4">
//       {notifications.length === 0 ? (
//         <div className="text-center p-4">
//           <h3 className="text-lg font-medium">No Notifications</h3>
//           <p className="text-sm text-gray-500">
//             You have no unread notifications at the moment.
//           </p>
//         </div>
//       ) : (
//         notifications.map((notification) => (
//           <NotificationBox key={notification.id} notification={notification} />
//         ))
//       )}
//     </div>
//   );
// };










// "use client";
// import { useState, useEffect, useRef } from "react";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";
// import {
//   messaging,
//   requestNotificationPermission,
//   onMessageListener,
// } from "../../../../lib/firebase";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [fcmToken, setFcmToken] = useState<string | null>(null);
//   const userId = "user123";
//   const socketRef = useRef<Socket | null>(null);
//   const vapidKey =
//     "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";

//   const fetchNotifications = async () => {
//     try {
//       console.log("Fetching notifications for user:", userId);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/${userId}`
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("Notifications fetched:", data);
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   const sendFcmTokenToBackend = async (token: string) => {
//     try {
//       console.log("Sending FCM token to backend:", token);
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/fcm-token`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ fcmToken: token }),
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`Failed to send FCM token: ${response.status}`);
//       }
//       const result = await response.json();
//       console.log("Backend response:", result);
//       setFcmToken(token);
//     } catch (error) {
//       console.error("Error sending FCM token to backend:", error);
//     }
//   };

//   const checkTokenRefresh = async () => {
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission === "granted" && messaging) {
//         const newToken = await requestNotificationPermission(vapidKey);
//         if (newToken && newToken !== fcmToken) {
//           console.log("FCM token changed:", newToken);
//           await sendFcmTokenToBackend(newToken);
//         }
//       } else {
//         console.warn("Notification permission not granted for token refresh");
//       }
//     } catch (error) {
//       console.error("Error checking FCM token:", error);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, [userId]);

//   useEffect(() => {
//     // Register service worker
//     const registerServiceWorker = async () => {
//       if ("serviceWorker" in navigator) {
//         try {
//           const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
//           console.log("Service Worker registered:", registration);
//         } catch (error) {
//           console.error("Service Worker registration failed:", error);
//         }
//       }
//     };

//     registerServiceWorker();

//     // Request initial notification permission and get FCM token
//     requestNotificationPermission(vapidKey).then((token) => {
//       if (token) {
//         sendFcmTokenToBackend(token);
//       } else {
//         console.warn("No FCM token generated");
//       }
//     });

//     // Periodically check for token refresh
//     const tokenCheckInterval = setInterval(checkTokenRefresh, 1 * 60 * 1000);

//     // Handle service worker messages for token refresh
//     const handleServiceWorkerMessage = (event: MessageEvent) => {
//       if (event.data && event.data.type === "TOKEN_REFRESH") {
//         console.log("Received TOKEN_REFRESH from service worker");
//         checkTokenRefresh();
//       }
//     };
//     navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

//     // Handle foreground notifications
//     onMessageListener().then((payload: any) => {
//       const notification = {
//         id: new Date().toISOString(),
//         title: payload.notification?.title || "New Notification",
//         message: payload.notification?.body || "You have a new notification.",
//         userId,
//         timestamp: new Date().toISOString(),
//       };
//       setNotifications((prev) => {
//         if (prev.some((n) => n.message === notification.message)) {
//           return prev;
//         }
//         return [notification, ...prev];
//       });
//     });

//     // WebSocket setup
//     console.log("Establishing WebSocket connection");
//     socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       console.log("WebSocket connected:", socket.id);
//       socket.emit("join", userId);
//     });

//     socket.on("notification", (notification: Notification) => {
//       console.log("Received WebSocket notification:", notification);
//       if (notification.userId === userId) {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.id === notification.id)) {
//             console.log("Duplicate notification ignored:", notification.id);
//             return prev;
//           }
//           return [notification, ...prev];
//         });
//       }
//     });

//     socket.on("notificationDeleted", (id: string) => {
//       console.log("Received notificationDeleted:", id);
//       setNotifications((prev) => prev.filter((notification) => notification.id !== id));
//     });

//     socket.on("disconnect", () => {
//       console.log("WebSocket disconnected");
//     });

//     return () => {
//       console.log("Cleaning up WebSocket connection");
//       socket.disconnect();
//       socketRef.current = null;
//       clearInterval(tokenCheckInterval);
//       navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
//     };
//   }, [userId]);

//   return (
//     <div className="space-y-4">
//       {notifications.length === 0 ? (
//         <div className="text-center p-4">
//           <h3 className="text-lg font-medium">No Notifications</h3>
//           <p className="text-sm text-gray-500">
//             You have no unread notifications at the moment.
//           </p>
//         </div>
//       ) : (
//         notifications.map((notification) => (
//           <NotificationBox key={notification.id} notification={notification} />
//         ))
//       )}
//     </div>
//   );
// };


// // components/NotificationList.tsx
// "use client";
// import { useState, useEffect, useRef } from "react";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";
// import {
//   messaging,
//   requestNotificationPermission,
//   onMessageListener,
// } from "../../../../lib/firebase";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [fcmToken, setFcmToken] = useState<string | null>(null);
//   const userId = "user123";
//   const socketRef = useRef<Socket | null>(null);
//   const vapidKey =
//     "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";
//   const backendUrl = "http://localhost:3002"; // Hardcode for debugging

//   const fetchNotifications = async () => {
//     try {
//       console.log("Fetching notifications for user:", userId);
//       const response = await fetch(`${backendUrl}/notifications/${userId}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
//       }
//       const data = await response.json();
//       console.log("Notifications fetched:", data);
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   const sendFcmTokenToBackend = async (token: string) => {
//     try {
//       console.log("Sending FCM token to backend:", token);
//       const response = await fetch(`${backendUrl}/users/${userId}/fcm-token`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fcmToken: token }),
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to send FCM token: ${response.status} ${response.statusText} - ${errorText}`);
//       }
//       const result = await response.json();
//       console.log("Backend response:", result);
//       setFcmToken(token);
//     } catch (error) {
//       console.error("Error sending FCM token to backend:", error);
//     }
//   };

//   // const checkTokenRefresh = async () => {
//   //   try {
//   //     const permission = await Notification.requestPermission();
//   //     if (permission === "granted" && messaging) {
//   //       const newToken = await requestNotificationPermission(vapidKey);
//   //       if (newToken && newToken !== fcmToken) {
//   //         console.log("FCM token changed:", newToken);
//   //         await sendFcmTokenToBackend(newToken);
//   //       }
//   //     } else {
//   //       console.warn("Notification permission not granted for token refresh");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error checking FCM token:", error);
//   //   }
//   // };

//   useEffect(() => {
//     // Log environment variable for debugging
//     console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);

//     fetchNotifications();

//     // Register service worker
//     const registerServiceWorker = async () => {
//       if ("serviceWorker" in navigator) {
//         try {
//           const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
//           console.log("Service Worker registered:", registration);
//           // Request FCM token after service worker registration
//           const token = await requestNotificationPermission(vapidKey);
//           if (token) {
//             await sendFcmTokenToBackend(token);
//           } else {
//             console.warn("No FCM token generated");
//           }
//         } catch (error) {
//           console.error("Service Worker registration failed:", error);
//         }
//       } else {
//         console.error("Service Worker not supported in this browser");
//       }
//     };

//     registerServiceWorker();

//     // // Periodically check for token refresh
//     // const tokenCheckInterval = setInterval(checkTokenRefresh, 1 * 60 * 1000);

//     // Handle service worker messages for token refresh
//     const handleServiceWorkerMessage = (event: MessageEvent) => {
//       if (event.data && event.data.type === "TOKEN_REFRESH") {
//         console.log("Received TOKEN_REFRESH from service worker:", event.data);
//         if (event.data.token) {
//           sendFcmTokenToBackend(event.data.token);
//         }
//       }
//     };
//     navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

//     // Handle foreground notifications
//     onMessageListener().then((payload: any) => {
//       console.log("Foreground notification received:", payload);
//       const notification = {
//         id: new Date().toISOString(),
//         title: payload.notification?.title || "New Notification",
//         message: payload.notification?.body || "You have a new notification.",
//         userId,
//         timestamp: new Date().toISOString(),
//       };
//       setNotifications((prev) => {
//         if (prev.some((n) => n.message === notification.message)) {
//           return prev;
//         }
//         return [notification, ...prev];
//       });
//     });

//     // WebSocket setup
//     console.log("Establishing WebSocket connection to:", backendUrl);
//     socketRef.current = io(backendUrl);
//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       console.log("WebSocket connected:", socket.id);
//       socket.emit("join", userId);
//     });

//     socket.on("notification", (notification: Notification) => {
//       console.log("Received WebSocket notification:", notification);
//       if (notification.userId === userId) {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.id === notification.id)) {
//             console.log("Duplicate notification ignored:", notification.id);
//             return prev;
//           }
//           return [notification, ...prev];
//         });
//       }
//     });

//     socket.on("notificationDeleted", (id: string) => {
//       console.log("Received notificationDeleted:", id);
//       setNotifications((prev) => prev.filter((notification) => notification.id !== id));
//     });

//     socket.on("disconnect", () => {
//       console.log("WebSocket disconnected");
//     });

//     return () => {
//       console.log("Cleaning up WebSocket connection");
//       socket.disconnect();
//       socketRef.current = null;
//       // clearInterval(tokenCheckInterval);
//       navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
//     };
//   }, [userId]);

//   return (
//     <div className="space-y-4">
//       {notifications.length === 0 ? (
//         <div className="text-center p-4">
//           <h3 className="text-lg font-medium">No Notifications</h3>
//           <p className="text-sm text-gray-500">
//             You have no unread notifications at the moment.
//           </p>
//         </div>
//       ) : (
//         notifications.map((notification) => (
//           <NotificationBox key={notification.id} notification={notification} />
//         ))
//       )}
//     </div>
//   );
// };



// // components/NotificationList.tsx
// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";
// import {
//   messaging,
//   requestNotificationPermission,
//   onMessageListener,
// } from "../../../../lib/firebase";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [fcmToken, setFcmToken] = useState<string | null>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const vapidKey =
//     "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";
//   const backendUrl = "http://localhost:3002"; // Hardcode for debugging
//   const { user, isLoading: isAuthLoading } = useUser();

//   const fetchNotifications = useCallback(async (userId: string) => {
//     try {
//       console.log("Fetching notifications for user:", userId);
//       const response = await fetch(`${backendUrl}/notifications/${encodeURIComponent(userId)}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
//       }
//       const data = await response.json();
//       console.log("Notifications fetched:", data);
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   }, []);

//   const sendFcmTokenToBackend = useCallback(async (token: string, userId: string, retries = 3): Promise<boolean> => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         console.log(`Sending FCM token to backend for user ${userId} (attempt ${attempt}):`, token);
//         const response = await fetch(`${backendUrl}/users/${encodeURIComponent(userId)}/fcm-token`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ fcmToken: token }),
//         });
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`Failed to send FCM token: ${response.status} ${response.statusText} - ${errorText}`);
//         }
//         const result = await response.json();
//         console.log("Backend response:", result);
//         setFcmToken(token);
//         return true;
//       } catch (error) {
//         console.error(`Error sending FCM token (attempt ${attempt}):`, error);
//         if (attempt < retries) {
//           console.log(`Retrying in ${attempt * 1000}ms...`);
//           await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
//         } else {
//           console.error("Max retries reached. Failed to send FCM token.");
//           return false;
//         }
//       }
//     }
//     return false;
//   }, []);

//   const initializeNotifications = useCallback(async (userId: string) => {
//     if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
//       console.error("Service Worker not supported or not running in browser");
//       return;
//     }

//     try {
//       console.log("Registering service worker...");
//       const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
//       console.log("Service Worker registered:", registration);

//       // Request FCM token
//       const token = await requestNotificationPermission(vapidKey);
//       if (token) {
//         await sendFcmTokenToBackend(token, userId);
//       } else {
//         console.warn("No FCM token generated");
//       }
//     } catch (error) {
//       console.error("Service Worker registration or token generation failed:", error);
//     }
//   }, [sendFcmTokenToBackend]);

//   useEffect(() => {
//     if (isAuthLoading || !user?.email) {
//       console.log("Waiting for user authentication...");
//       return;
//     }

//     const userId = user.email;
//     console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL || backendUrl);
//     console.log("Authenticated user:", userId);

//     fetchNotifications(userId);
//     initializeNotifications(userId);

//     // Handle foreground notifications
//     onMessageListener().then((payload: any) => {
//       console.log("Foreground notification received:", payload);
//       const notification = {
//         id: new Date().toISOString(),
//         title: payload.notification?.title || "New Notification",
//         message: payload.notification?.body || "You have a new notification.",
//         userId,
//         timestamp: new Date().toISOString(),
//       };
//       setNotifications((prev) => {
//         if (prev.some((n) => n.message === notification.message)) {
//           return prev;
//         }
//         return [notification, ...prev];
//       });
//     });

//     // WebSocket setup
//     console.log("Establishing WebSocket connection to:", backendUrl);
//     socketRef.current = io(backendUrl);
//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       console.log("WebSocket connected:", socket.id);
//       socket.emit("join", userId);
//     });

//     socket.on("notification", (notification: Notification) => {
//       console.log("Received WebSocket notification:", notification);
//       if (notification.userId === userId) {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.id === notification.id)) {
//             console.log("Duplicate notification ignored:", notification.id);
//             return prev;
//           }
//           return [notification, ...prev];
//         });
//       }
//     });

//     socket.on("notificationDeleted", (id: string) => {
//       console.log("Received notificationDeleted:", id);
//       setNotifications((prev) => prev.filter((notification) => notification.id !== id));
//     });

//     socket.on("disconnect", () => {
//       console.log("WebSocket disconnected");
//     });

//     // Handle service worker messages for token refresh
//     const handleServiceWorkerMessage = (event: MessageEvent) => {
//       if (event.data && event.data.type === "TOKEN_REFRESH") {
//         console.log("Received TOKEN_REFRESH from service worker:", event.data);
//         if (event.data.token) {
//           sendFcmTokenToBackend(event.data.token, userId);
//         }
//       }
//     };
//     navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

//     return () => {
//       console.log("Cleaning up WebSocket connection");
//       socket.disconnect();
//       socketRef.current = null;
//       navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
//     };
//   }, [user, isAuthLoading, fetchNotifications, initializeNotifications, sendFcmTokenToBackend]);

//   return (
//     <div className="space-y-4">
//       {isAuthLoading ? (
//         <div className="text-center p-4">
//           <p>Loading user authentication...</p>
//         </div>
//       ) : !user?.email ? (
//         <div className="text-center p-4">
//           <p>Please log in to view notifications.</p>
//         </div>
//       ) : notifications.length === 0 ? (
//         <div className="text-center p-4">
//           <h3 className="text-lg font-medium">No Notifications</h3>
//           <p className="text-sm text-gray-500">
//             You have no unread notifications at the moment.
//           </p>
//         </div>
//       ) : (
//         notifications.map((notification) => (
//           <NotificationBox key={notification.id} notification={notification} />
//         ))
//       )}
//     </div>
//   );
// };











// // components/NotificationList.tsx
// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";
// import {
//   messaging,
//   requestNotificationPermission,
//   onMessageListener,
// } from "../../../../lib/firebase";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [fcmToken, setFcmToken] = useState<string | null>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const vapidKey =
//     "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";
//   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

//   const { user, isLoading: isAuthLoading } = useUser();

//   const isValidEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const fetchNotifications = useCallback(async (userId: string) => {
//     if (!isValidEmail(userId)) {
//       console.error("Invalid email format for userId:", userId);
//       return;
//     }
//     try {
//       console.log("Fetching notifications for user:", userId);
//       const response = await fetch(`${backendUrl}/notifications/${encodeURIComponent(userId)}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
//       }
//       const data = await response.json();
//       console.log("Notifications fetched:", data);
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   }, [backendUrl]);

//   const sendFcmTokenToBackend = useCallback(async (token: string, userId: string, retries = 3): Promise<boolean> => {
//     if (!isValidEmail(userId)) {
//       console.error("Invalid email format for userId:", userId);
//       return false;
//     }
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         console.log(`Sending FCM token to backend for user ${userId} (attempt ${attempt}):`, token);
//         const response = await fetch(`${backendUrl}/users/${encodeURIComponent(userId)}/fcm-token`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ fcmToken: token }),
//         });
//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`Failed to send FCM token: ${response.status} ${response.statusText} - ${errorText}`);
//         }
//         const result = await response.json();
//         console.log("Backend response:", result);
//         setFcmToken(token);
//         return true;
//       } catch (error) {
//         console.error(`Error sending FCM token (attempt ${attempt}):`, error);
//         if (attempt < retries) {
//           console.log(`Retrying in ${attempt * 1000}ms...`);
//           await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
//         } else {
//           console.error("Max retries reached. Failed to send FCM token.");
//           return false;
//         }
//       }
//     }
//     return false;
//   }, [backendUrl]);

//   const initializeNotifications = useCallback(async (userId: string) => {
//     if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
//       console.error("Service Worker not supported or not running in browser");
//       return;
//     }

//     try {
//       console.log("Registering service worker...");
//       const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
//       console.log("Service Worker registered:", registration);

//       const token = await requestNotificationPermission(vapidKey);
//       if (token) {
//         const success = await sendFcmTokenToBackend(token, userId);
//         if (success) {
//           console.log("FCM token successfully sent to backend for user:", userId);
//         } else {
//           console.error("Failed to send FCM token to backend for user:", userId);
//         }
//       } else {
//         console.warn("No FCM token generated");
//       }
//     } catch (error) {
//       console.error("Service Worker registration or token generation failed:", error);
//     }
//   }, [sendFcmTokenToBackend]);

//   useEffect(() => {
//     if (isAuthLoading) {
//       console.log("Waiting for user authentication...");
//       return;
//     }
//     if (!user?.email || !isValidEmail(user.email)) {
//       console.error("User not authenticated or invalid email:", user?.email);
//       return;
//     }

//     const userId = user.email; // Use Auth0 email (e.g., anjana@gmail.com)
//     console.log("Authenticated user:", userId);
//     console.log("Backend URL:", backendUrl);

//     fetchNotifications(userId);
//     initializeNotifications(userId);

//     // Handle foreground notifications
//     onMessageListener().then((payload: any) => {
//       console.log("Foreground notification received:", payload);
//       const notification = {
//         id: new Date().toISOString(),
//         title: payload.notification?.title || "New Notification",
//         message: payload.notification?.body || "You have a new notification.",
//         userId,
//         timestamp: new Date().toISOString(),
//       };
//       setNotifications((prev) => {
//         if (prev.some((n) => n.message === notification.message)) {
//           return prev;
//         }
//         return [notification, ...prev];
//       });
//     });

//     // WebSocket setup
//     console.log("Establishing WebSocket connection to:", backendUrl);
//     socketRef.current = io(backendUrl);
//     const socket = socketRef.current;

//     socket.on("connect", () => {
//       console.log("WebSocket connected:", socket.id);
//       socket.emit("join", userId);
//     });

//     socket.on("notification", (notification: Notification) => {
//       console.log("Received WebSocket notification:", notification);
//       if (notification.userId === userId) {
//         setNotifications((prev) => {
//           if (prev.some((n) => n.id === notification.id)) {
//             console.log("Duplicate notification ignored:", notification.id);
//             return prev;
//           }
//           return [notification, ...prev];
//         });
//       }
//     });

//     socket.on("notificationDeleted", (id: string) => {
//       console.log("Received notificationDeleted:", id);
//       setNotifications((prev) => prev.filter((notification) => notification.id !== id));
//     });

//     socket.on("disconnect", () => {
//       console.log("WebSocket disconnected");
//     });

//     // Handle service worker messages for token refresh
//     const handleServiceWorkerMessage = (event: MessageEvent) => {
//       if (event.data && event.data.type === "TOKEN_REFRESH") {
//         console.log("Received TOKEN_REFRESH from service worker:", event.data);
//         if (event.data.token) {
//           sendFcmTokenToBackend(event.data.token, userId);
//         }
//       }
//     };
//     navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

//     return () => {
//       console.log("Cleaning up WebSocket connection");
//       socket.disconnect();
//       socketRef.current = null;
//       navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
//     };
//   }, [user, isAuthLoading, fetchNotifications, initializeNotifications, sendFcmTokenToBackend, backendUrl]);

//   return (
//     <div className="space-y-4">
//       {isAuthLoading ? (
//         <div className="text-center p-4">
//           <p>Loading user authentication...</p>
//         </div>
//       ) : !user?.email ? (
//         <div className="text-center p-4">
//           <p>Please log in to view notifications.</p>
//         </div>
//       ) : notifications.length === 0 ? (
//         <div className="text-center p-4">
//           <h3 className="text-lg font-medium">No Notifications</h3>
//           <p className="text-sm text-gray-500">
//             You have no unread notifications at the moment.
//           </p>
//         </div>
//       ) : (
//         notifications.map((notification) => (
//           <NotificationBox key={notification.id} notification={notification} />
//         ))
//       )}
//     </div>
//   );
// };









"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { NotificationBox } from "./NotificationBox";
import io, { Socket } from "socket.io-client";
import {
  messaging,
  requestNotificationPermission,
  onMessageListener,
} from "../../../../lib/firebase";

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  timestamp: string;
}

export const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const vapidKey =
    "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

  const { user, isLoading: isAuthLoading } = useUser();

  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidFcmToken = (token: string): boolean => {
    return typeof token === "string" && token.length > 100;
  };

  const fetchNotifications = useCallback(async (userId: string) => {
    if (!isValidEmail(userId)) {
      console.error("Invalid email format for userId:", userId);
      return;
    }
    try {
      console.log("Fetching notifications for user:", userId);
      const response = await fetch(`${backendUrl}/notifications/${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Notifications fetched:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [backendUrl]);

  const sendFcmTokenToBackend = useCallback(async (token: string, userId: string, retries = 3): Promise<boolean> => {
    if (!isValidEmail(userId)) {
      console.error("Invalid email format for userId:", userId);
      return false;
    }
    if (!isValidFcmToken(token)) {
      console.error("Invalid FCM token format:", token);
      return false;
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Sending FCM token to backend for user ${userId} (attempt ${attempt}):`, token.substring(0, 10) + '...');
        const response = await fetch(`${backendUrl}/users/${encodeURIComponent(userId)}/fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to send FCM token: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        console.log("Backend response:", result);
        setFcmToken(token);
        return true;
      } catch (error) {
        console.error(`Error sending FCM token (attempt ${attempt}):`);
        if (attempt < retries) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        } else {
          console.error("Max retries reached. Failed to send FCM token:");
          return false;
        }
      }
    }
    return false;
  }, [backendUrl]);

  const initializeNotifications = useCallback(async (userId: string) => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.error("Service Worker not supported or not running in browser");
      return;
    }

    try {
      console.log("Registering service worker...");
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      console.log("Service Worker registered:", registration);

      const token = await requestNotificationPermission(vapidKey);
      if (token) {
        const success = await sendFcmTokenToBackend(token, userId);
        if (success) {
          console.log("FCM token successfully sent to backend for user:", userId);
        } else {
          console.error("Failed to send FCM token to backend for user:", userId);
        }
      } else {
        console.warn("No FCM token generated");
      }
    } catch (error) {
      console.error("Service Worker registration or token generation failed:", error);
    }
  }, [sendFcmTokenToBackend]);

  useEffect(() => {
    if (isAuthLoading) {
      console.log("Waiting for user authentication...");
      return;
    }
    if (!user?.email || !isValidEmail(user.email)) {
      console.error("User not authenticated or invalid email:", user?.email);
      return;
    }

    const userId = user.email; // Use Auth0 email (e.g., anjana@gmail.com)
    console.log("Authenticated user:", userId);
    console.log("Backend URL:", backendUrl);

    fetchNotifications(userId);
    initializeNotifications(userId);

    // Handle foreground notifications
    onMessageListener().then((payload: any) => {
      console.log("Foreground notification received:", payload);
      const notification = {
        id: new Date().toISOString(),
        title: payload.notification?.title || "New Notification",
        message: payload.notification?.body || "You have a new notification.",
        userId,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.message === notification.message)) {
          return prev;
        }
        return [notification, ...prev];
      });
    });

    // WebSocket setup
    console.log("Establishing WebSocket connection to:", backendUrl);
    socketRef.current = io(backendUrl);
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      socket.emit("join", userId);
    });

    socket.on("notification", (notification: Notification) => {
      console.log("Received WebSocket notification:", notification);
      if (notification.userId === userId) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) {
            console.log("Duplicate notification ignored:", notification.id);
            return prev;
          }
          return [notification, ...prev];
        });
      }
    });

    socket.on("notificationDeleted", (id: string) => {
      console.log("Received notificationDeleted:", id);
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    // Handle service worker messages for token refresh
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "TOKEN_REFRESH") {
        console.log("Received TOKEN_REFRESH from service worker:", event.data);
        if (event.data.token && isValidFcmToken(event.data.token)) {
          sendFcmTokenToBackend(event.data.token, userId);
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      console.log("Cleaning up WebSocket connection");
      socket.disconnect();
      socketRef.current = null;
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [user, isAuthLoading, fetchNotifications, initializeNotifications, sendFcmTokenToBackend, backendUrl]);

  return (
    <div className="space-y-4">
      {isAuthLoading ? (
        <div className="text-center p-4">
          <p>Loading user authentication...</p>
        </div>
      ) : !user?.email ? (
        <div className="text-center p-4">
          <p>Please log in to view notifications.</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center p-4">
          <h3 className="text-lg font-medium">No Notifications</h3>
          <p className="text-sm text-gray-500">
            You have no unread notifications at the moment.
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <NotificationBox key={notification.id} notification={notification} />
        ))
      )}
    </div>
  );
};