
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SunIcon, MoonIcon, BellRing } from "lucide-react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";

//const API_BASE = "http://localhost:3001/user";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL1 || "http://localhost:3001";

interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  read: boolean;
}

export const DashboardHeader = () => {
  const [time, setTime] = useState(new Date());
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("User");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  const { user, isLoading: isAuthLoading } = useUser();

  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const fetchNotifications = useCallback(async (userId: string) => {
    if (!isValidEmail(userId)) {
      console.error("Invalid email format for userId:", userId);
      return;
    }
    try {
      console.log("Fetching notifications for user:", userId);
      const response = await fetch(
        `${BACKEND_URL}/notifications/${encodeURIComponent(userId)}`
      );
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Notifications fetched:", data);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const initializeWebSocket = useCallback((userId: string) => {
    if (socketRef.current) {
      console.log("WebSocket already exists, cleaning up...");
      socketRef.current.disconnect();
    }

    console.log(
      "Establishing WebSocket connection to:",
      `${BACKEND_URL}/notifications`
    );
    const socket = io(`${BACKEND_URL}/notifications`, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      setIsConnected(true);
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
          return [notification, ...prev];
        });
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
        const filtered = prev.filter((notification) => notification.id !== id);
        console.log(
          `Removed notification ${id} from state. Before: ${prev.length}, After: ${filtered.length}`
        );
        return filtered;
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return socket;
  }, []);

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

    fetchNotifications(userId);
    const socket = initializeWebSocket(userId);

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socketRef.current) {
        socketRef.current.emit("leave", userId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, isAuthLoading, fetchNotifications, initializeWebSocket]);

  const handleBellClick = () => {
    router.push("/notification");
  };

  const handleRoleChange = (event: { target: { value: any } }) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);
    const destination = newRole === "User" ? "/dashboard" : "/admin";
    router.push(destination);
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user?.email) {
      axios
        .get(`${BACKEND_URL}/user/profile-short/${encodeURIComponent(user.email)}`)
        .then(({ data }) => {
          console.log("Fetched profile data:", data);
          setProfileData(data);
        })
        .catch((err) => console.error("Failed to load profile:", err));
    }
  }, [isAuthLoading, user]);

  const hour = time.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 15 ? "Good Afternoon" : "Good Evening";

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = time.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const Icon = hour < 15 ? SunIcon : MoonIcon;

  const getDisplayName = (name: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(name) ? name.split("@")[0] : name;
  };

  return (
    <header className="relative flex h-20 items-center justify-between border-b px-4">
      <div className="flex items-center z-10">
        <SidebarTrigger className="mr-2" />
      </div>

<div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden 2xl:block">
        {profileData && profileData.name ? (
          <span className="text-lg text-foreground font-semibold flex items-center gap-1">
            <Icon
              className={`w-4 h-4 ${
                hour < 15 ? "text-yellow-400" : "text-blue-800"
              }`}
            />
            {greeting}, {getDisplayName(profileData.name)} | {formattedDate} |{" "}
            {formattedTime}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-6 z-10 pr-4">
        <button
          className="relative p-1 rounded-md"
          onClick={handleBellClick}
          aria-label="Notifications"
        >
          <BellRing className="w-5 h-5 text-gray-500 hover:text-teal-400 transition-colors duration-200 cursor-pointer" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <Link href="/Settings/profileManagement" passHref>
          <Avatar
            className="h-15 w-15 ml-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname === "/Settings/profileManagement") {
                window.location.reload();
              } else {
                router.push("/Settings/profileManagement");
              }
            }}
          >
         <AvatarImage
  src={
    profileData?.picture
      ? profileData.picture.startsWith("/uploads")
        ? `${BACKEND_URL}${profileData.picture}`
        : profileData.picture.startsWith("http")
          ? profileData.picture
          : "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
      : "https://res.cloudinary.com/dj5086rhp/image/upload/v1753210736/default_ska3wz.png"
  }
  className="border border-muted-foreground rounded-full"
  alt="User Profile"
/>
          </Avatar>
        </Link>

        <select
          value={selectedRole}
          onChange={handleRoleChange}
          className="ml-2 p-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
          aria-label="Select Role"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
    </header>
  );
};
