// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { NotificationBox } from "./NotificationBox";
// import io, { Socket } from "socket.io-client";

// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   userId: string;
//   timestamp: string;
//   read: boolean;
// }

// export const NotificationList: React.FC = () => {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<
//     "connecting" | "connected" | "disconnected"
//   >("disconnected");
//   const socketRef = useRef<Socket | null>(null);

//   const backendUrl =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002/device-api";

//   const { user, isLoading: isAuthLoading } = useUser();

//   const isValidEmail = (email: string): boolean => {
//     if (!email || typeof email !== "string") return false;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const fetchNotifications = useCallback(
//     async (userId: string) => {
//       if (!isValidEmail(userId)) {
//         console.error("Invalid email format for userId:", userId);
//         return;
//       }
//       try {
//         console.log("Fetching notifications for user:", userId);
//         const response = await fetch(
//           `${backendUrl}/notifications/${encodeURIComponent(userId)}`
//         );
//         if (!response.ok) {
//           throw new Error(
//             `HTTP error! status: ${response.status} ${response.statusText}`
//           );
//         }
//         const data = await response.json();
//         console.log("Notifications fetched:", data);
//         setNotifications(data);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       }
//     },
//     [backendUrl]
//   );

//   const initializeWebSocket = useCallback(
//     (userId: string) => {
//       if (socketRef.current) {
//         console.log("WebSocket already exists, cleaning up...");
//         socketRef.current.disconnect();
//       }

//       console.log(
//         "Establishing WebSocket connection to:",
//         `${backendUrl}/notifications`
//       );
//       setConnectionStatus("connecting");

//       const socket = io(`${backendUrl}/notifications`, {
//         transports: ["websocket", "polling"],
//         timeout: 10000,
//         forceNew: true,
//       });

//       socketRef.current = socket;

//       socket.on("connect", () => {
//         console.log("WebSocket connected:", socket.id);
//         setIsConnected(true);
//         setConnectionStatus("connected");

//         console.log("Joining room for user:", userId);
//         socket.emit("join", userId);
//       });

//       socket.on("joined", (data: { userId: string; socketId: string }) => {
//         console.log("Successfully joined room:", data);
//       });

//       socket.on("notification", (notification: Notification) => {
//         console.log("Received WebSocket notification:", notification);
//         if (notification.userId === userId) {
//           setNotifications((prev) => {
//             const exists = prev.some((n) => n.id === notification.id);
//             if (exists) {
//               console.log("Duplicate notification ignored:", notification.id);
//               return prev;
//             }
//             console.log("Adding new notification to state:", notification.id);
//             return [notification, ...prev];
//           });
//         }
//       });

//       socket.on("notificationRead", (notification: Notification) => {
//         console.log("Received notificationRead:", notification);
//         setNotifications((prev) =>
//           prev.map((n) =>
//             n.id === notification.id ? { ...n, read: notification.read } : n
//           )
//         );
//       });

//       socket.on("notificationDeleted", (id: string) => {
//         console.log("Received notificationDeleted:", id);
//         setNotifications((prev) => {
//           const filtered = prev.filter(
//             (notification) => notification.id !== id
//           );
//           console.log(
//             `Removed notification ${id} from state. Before: ${prev.length}, After: ${filtered.length}`
//           );
//           return filtered;
//         });
//       });

//       socket.on("disconnect", (reason) => {
//         console.log("WebSocket disconnected:", reason);
//         setIsConnected(false);
//         setConnectionStatus("disconnected");
//       });

//       socket.on("connect_error", (error) => {
//         console.error("WebSocket connection error:", error);
//         setIsConnected(false);
//         setConnectionStatus("disconnected");
//       });

//       socket.on("error", (error) => {
//         console.error("WebSocket error:", error);
//       });

//       return socket;
//     },
//     [backendUrl]
//   );

//   useEffect(() => {
//     if (isAuthLoading) {
//       console.log("Waiting for user authentication...");
//       return;
//     }

//     if (!user?.email || !isValidEmail(user.email)) {
//       console.error("User not authenticated or invalid email:", user?.email);
//       return;
//     }

//     const userId = user.email;
//     console.log("Authenticated user:", userId);

//     fetchNotifications(userId);
//     const socket = initializeWebSocket(userId);

//     return () => {
//       console.log("Cleaning up WebSocket connection and listeners");
//       if (socketRef.current) {
//         socketRef.current.emit("leave", userId);
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//       setIsConnected(false);
//       setConnectionStatus("disconnected");
//     };
//   }, [user, isAuthLoading, fetchNotifications, initializeWebSocket]);

//   const renderConnectionStatus = () => {
//     const statusColor = {
//       connecting: "text-yellow-500",
//       connected: "text-green-500",
//       disconnected: "text-red-500",
//     };

//     return (
//       <div className={`text-xs ${statusColor[connectionStatus]} mb-2`}>
//         {/* WebSocket: {connectionStatus} */}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {process.env.NODE_ENV === "development" && renderConnectionStatus()}

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
//           <NotificationBox
//             key={notification.id}
//             notification={notification}
//             onDelete={(id) => {
//               setNotifications((prev) => prev.filter((n) => n.id !== id));
//             }}
//             onRead={(id) => {
//               setNotifications((prev) =>
//                 prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//               );
//             }}
//           />
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

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
}

export const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const socketRef = useRef<Socket | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002/device-api";

  const { user, isLoading: isAuthLoading } = useUser();

  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchNotifications = useCallback(
    async (userId: string) => {
      if (!isValidEmail(userId)) {
        console.error("Invalid email format for userId:", userId);
        return;
      }
      try {
        console.log("Fetching notifications for user:", userId);
        const response = await fetch(
          `${backendUrl}/notifications/${encodeURIComponent(userId)}`
        );
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log("Notifications fetched:", data);
        setNotifications((prev) => {
          // Merge new notifications to avoid duplicates and maintain order
          const newNotifications = data.filter(
            (newNotif: Notification) => !prev.some((n) => n.id === newNotif.id)
          );
          return [...newNotifications, ...prev].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    },
    [backendUrl]
  );

  const initializeWebSocket = useCallback(
    (userId: string) => {
      if (socketRef.current) {
        console.log("WebSocket already exists, cleaning up...");
        socketRef.current.disconnect();
      }

      console.log(
        "Establishing WebSocket connection to:",
        `${backendUrl}/notifications`
      );
      setConnectionStatus("connecting");

      const socket = io(`${backendUrl}/notifications`, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 1,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 2000,
        timeout: 3000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("WebSocket connected:", socket.id);
        setIsConnected(true);
        setConnectionStatus("connected");

        console.log("Joining room for user:", userId);
        socket.emit("join", userId);
      });

      socket.on("joined", (data: { userId: string; socketId: string }) => {
        console.log("Successfully joined room:", data);
      });

      socket.on("notification", (notification: Notification) => {
        console.log("Received WebSocket notification:", notification);
        if (notification.userId === userId) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === notification.id);
            if (exists) {
              console.log("Duplicate notification ignored:", notification.id);
              return prev;
            }
            console.log("Adding new notification to state:", notification.id);
            return [notification, ...prev].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );
          });
        } else {
          console.warn(
            `Notification userId mismatch: expected ${userId}, got ${notification.userId}`
          );
        }
      });

      socket.on("notificationRead", (notification: Notification) => {
        console.log("Received notificationRead:", notification);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: notification.read } : n
          )
        );
      });

      socket.on("notificationDeleted", (id: string) => {
        console.log("Received notificationDeleted:", id);
        setNotifications((prev) => {
          const filtered = prev.filter(
            (notification) => notification.id !== id
          );
          console.log(
            `Removed notification ${id} from state. Before: ${prev.length}, After: ${filtered.length}`
          );
          return filtered;
        });
      });

      socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
        setConnectionStatus("disconnected");
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      return socket;
    },
    [backendUrl]
  );

  useEffect(() => {
    if (isAuthLoading) {
      console.log("Waiting for user authentication...");
      return;
    }

    if (!user?.email || !isValidEmail(user.email)) {
      console.error("User not authenticated or invalid email:", user?.email);
      return;
    }

    const userId = user.email;
    console.log("Authenticated user:", userId);

    // Initial fetch
    fetchNotifications(userId);

    // Start polling every 10 seconds
    const pollingInterval = setInterval(() => {
      console.log("Polling for new notifications...");
      fetchNotifications(userId);
    }, 1000); // 10 seconds

    // Initialize WebSocket
    const socket = initializeWebSocket(userId);

    return () => {
      console.log("Cleaning up WebSocket connection and polling");
      if (socketRef.current) {
        socketRef.current.emit("leave", userId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      clearInterval(pollingInterval); // Clean up polling
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };
  }, [user, isAuthLoading, fetchNotifications, initializeWebSocket]);

  const renderConnectionStatus = () => {
    const statusColor = {
      connecting: "text-yellow-500",
      connected: "text-green-500",
      disconnected: "text-red-500",
    };

    return (
      <div className={`text-xs ${statusColor[connectionStatus]} mb-2`}>
        {/* WebSocket: {connectionStatus} */}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {process.env.NODE_ENV === "development" && renderConnectionStatus()}

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
          <NotificationBox
            key={notification.id}
            notification={notification}
            onDelete={(id) => {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
            }}
            onRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              );
            }}
          />
        ))
      )}
    </div>
  );
};
