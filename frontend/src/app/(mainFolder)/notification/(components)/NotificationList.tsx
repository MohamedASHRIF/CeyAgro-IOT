"use client";
import React, { useState, useEffect, useRef } from "react";
import { NotificationBox } from "./NotificationBox";
import io, { Socket } from "socket.io-client";
import {
  messaging,
  requestNotificationPermission,
  onMessageListener,
} from "../../../../lib/firebase";
import { getToken } from "firebase/messaging";

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
  const userId = "user123";
  const socketRef = useRef<Socket | null>(null);
  const vapidKey =
    "BPLGOtyyZvSjlT06sF_GUfdSjgV-AI8RNIuZtskSDKcl0i4vN-zatt1x5RJImPTF66qhnje13S1LgxjLlbT1kUg";

  //fetch existing notifications
  // const fetchNotifications = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3001/notifications/${userId}`
  //     );
  //     const data = await response.json();
  //     setNotifications(data);
  //   } catch (error) {
  //     console.error("Error fetching notifications:", error);
  //   }
  // };

  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications for user:", userId);
      const response = await fetch(
        `http://localhost:3001/notifications/${userId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Notifications fetched:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  //Sending FCM Token to Backend
  const sendFcmTokenToBackend = async (token: string) => {
    try {
      console.log("Sending FCM token to backend:", token);
      const response = await fetch(
        `http://localhost:3001/users/${userId}/fcm-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        }
      );
      const result = await response.json();
      console.log("Backend response:", result);
      setFcmToken(token);
    } catch (error) {
      console.error("Error sending FCM token to backend:", error);
    }
  };

  //monitor token refresh
  // const checkTokenRefresh = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission === "granted") {
  //       const newToken = await getToken(messaging, { vapidKey });
  //       if (newToken !== fcmToken && newToken) {
  //         console.log("FCM token changed:", newToken);
  //         sendFcmTokenToBackend(newToken);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error checking FCM token:", error);
  //   }
  // };

  const checkTokenRefresh = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted" && messaging) {
        const newToken = await getToken(messaging, { vapidKey });
        if (newToken !== fcmToken && newToken) {
          console.log("FCM token changed:", newToken);
          sendFcmTokenToBackend(newToken);
        }
      }
    } catch (error) {
      console.error("Error checking FCM token:", error);
    }
  };

  //fetch notifications once
  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    // Request initial notification permission and get FCM token
    requestNotificationPermission(vapidKey).then((token) => {
      if (token) {
        sendFcmTokenToBackend(token);
      }
    });

    // Periodically check for token refresh
    const tokenCheckInterval = setInterval(checkTokenRefresh, 5 * 60 * 1000);

    // Handle service worker messages for token refresh
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "TOKEN_REFRESH") {
        console.log("Received TOKEN_REFRESH from service worker");
        checkTokenRefresh();
      }
    };
    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    // Handle foreground notifications
    onMessageListener().then((payload: any) => {
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
    console.log("Establishing WebSocket connection");
    socketRef.current = io("http://localhost:3001");
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
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      console.log("Cleaning up WebSocket connection");
      socket.disconnect();
      socketRef.current = null;
      clearInterval(tokenCheckInterval);
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, [userId]);

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
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
