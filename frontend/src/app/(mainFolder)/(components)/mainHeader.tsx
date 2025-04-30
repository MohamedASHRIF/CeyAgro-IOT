"use client";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SunIcon, MoonIcon, BellRing } from "lucide-react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:3002/users";

export const DashboardHeader = () => {
  const [time, setTime] = useState(new Date());
  const [profileData, setProfileData] = useState<any>(null);

  const router = useRouter();
  const handleBellClick = () => {
    router.push("/notification");
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const Icon = hour < 18 ? SunIcon : MoonIcon;

  // Fetch short user data from API
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user && typeof user.email === "string") {
      const email = user.email;
      console.log("Fetching profile for", email);

      // Fetch user name and picture based on email
      axios
        .get(`${API_BASE}/profile-short/${encodeURIComponent(email)}`)
        .then(({ data }) => {
          console.log("email and img received:", data);
          setProfileData(data); // Store the entire data object
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
        });
    }
  }, [isLoading, user]);

  // Debug: Check if profileData is being fetched correctly
  console.log("Profile Data:", profileData);

  // Function to check if the name is an email and return the part before @
  const getDisplayName = (name: string) => {
    // Regular expression to check if the string looks like an email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // If name matches the email format, return the part before '@'
    if (emailRegex.test(name)) {
      return name.split("@")[0]; // Part before @
    }
    return name; // Otherwise, return the name as is
  };

  return (
    <header className="relative flex h-12 items-center justify-between border-b px-4">
      {/* Left: Sidebar toggle */}
      <div className="flex items-center z-10">
        <SidebarTrigger className="mr-2" />
      </div>

      {/* Center: Greeting + Timestamp */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden sm:block">
        <span className="text-md text-foreground font-semibold flex items-center gap-1">
          <Icon
            className={`w-4 h-4 ${
              hour < 18 ? "text-yellow-400" : "text-blue-800"
            }`}
          />
          {greeting},{" "}
          {(() => {
            if (!profileData || !profileData.name) return "User..."; // Fallback if profileData or name is missing

            const name = profileData.name.trim();

            // Debugging the value
            console.log("Name:", name);

            return getDisplayName(name); // Check if name is an email and return the part before @
          })()}{" "}
          | {formattedDate} | {formattedTime}
        </span>
      </div>

      {/* Right: Notification + Avatar */}
      <div className="flex items-center gap-6 z-10 pr-4">
        <button
          className="relative p-1 rounded-md"
          onClick={handleBellClick}
          aria-label="Notifications"
        >
          <BellRing className="w-5 h-5 text-gray-500 hover:text-teal-400 transition-colors duration-200 cursor-pointer" />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <Link href="/Settings/profileManagement" passHref>
          <Avatar
            className="h-8 w-8 ml-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname === "/Settings/profileManagement") {
                window.location.reload();
              } else {
                router.push("/Settings/profileManagement");
              }
            }}
          >
            {profileData?.picture && (
              <AvatarImage
                src={
                  profileData.picture &&
                  profileData.picture.startsWith("/uploads")
                    ? `http://localhost:3002${profileData.picture}`
                    : "/default.png"
                }
                className="border border-muted-foreground rounded-full"
                alt="img"
              />
            )}
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
