// "use client";
// import { useEffect, useState } from "react";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import { SunIcon, MoonIcon, BellRing } from "lucide-react";
// import axios from "axios";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// const API_BASE = "http://localhost:3002/user";

// export const DashboardHeader = () => {
//   const [time, setTime] = useState(new Date());
//   const [profileData, setProfileData] = useState<any>(null);

//   const router = useRouter();

//   const handleBellClick = () => {
//     router.push("/notification");
//   };

//   useEffect(() => {
//     const interval = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const hour = time.getHours();
//   const greeting =
//     hour < 12 ? "Good Morning" : hour < 15 ? "Good Afternoon" : "Good Evening";

//   const formattedTime = time.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const formattedDate = time.toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   const Icon = hour < 15 ? SunIcon : MoonIcon;

//   // Fetch user info
//   const { user, isLoading } = useUser();

//   useEffect(() => {
//     if (!isLoading && user?.email) {
//       axios
//         .get(`${API_BASE}/profile-short/${encodeURIComponent(user.email)}`)
//         .then(({ data }) => {
//           console.log("Fetched profile data:", data); 
//           setProfileData(data);
//         })
//         .catch((err) => console.error("Failed to load profile:", err));
//     }
//   }, [isLoading, user]);
  

//   const getDisplayName = (name: string) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(name) ? name.split("@")[0] : name;
//   };

//   return (
//     <header className="relative flex h-12 items-center justify-between border-b px-4">
//       {/* Left: Sidebar toggle */}
//       <div className="flex items-center z-10">
//         <SidebarTrigger className="mr-2" />
//       </div>

//       {/* Center: Greeting + Timestamp */}
//       <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden sm:block">
//         {profileData && profileData.name ? (
//           <span className="text-md text-foreground font-semibold flex items-center gap-1">
//             <Icon
//               className={`w-4 h-4 ${
//                 hour < 15 ? "text-yellow-400" : "text-blue-800"
//               }`}
//             />
//             {greeting}, {getDisplayName(profileData.name)} | {formattedDate} | {formattedTime}
//           </span>
//         ) : null}
//       </div>

//       {/* Right: Notification + Avatar */}
//       <div className="flex items-center gap-6 z-10 pr-4">
//         <button
//           className="relative p-1 rounded-md"
//           onClick={handleBellClick}
//           aria-label="Notifications"
//         >
//           <BellRing className="w-5 h-5 text-gray-500 hover:text-teal-400 transition-colors duration-200 cursor-pointer" />
//         </button>

//         <div className="h-6 w-px bg-gray-300" />

//         <Link href="/Settings/profileManagement" passHref>
//           <Avatar
//             className="h-8 w-8 ml-2 cursor-pointer"
//             onClick={(e) => {
//               e.preventDefault();
//               if (window.location.pathname === "/Settings/profileManagement") {
//                 window.location.reload();
//               } else {
//                 router.push("/Settings/profileManagement");
//               }
//             }}
//           >
//             <AvatarImage
//               src={
//                 profileData?.picture?.startsWith("/uploads")
//                   ? `http://localhost:3002${profileData.picture}`
//                   : "/default.png"
//               }
//               className="border border-muted-foreground rounded-full"
//               alt="User Profile"
//             />
//           </Avatar>
//         </Link>
//       </div>
//     </header>
//   );
// };

"use client";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SunIcon, MoonIcon, BellRing } from "lucide-react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:3001/user";  //define the base api

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

  const Icon = hour < 15 ? SunIcon : MoonIcon;

  // Fetch user info
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user?.email) {
      axios
        .get(`${API_BASE}/profile-short/${encodeURIComponent(user.email)}`)
        .then(({ data }) => {
          console.log("Fetched profile data:", data); 
          setProfileData(data);
        })
        .catch((err) => console.error("Failed to load profile:", err));
    }
  }, [isLoading, user]);
  

  const getDisplayName = (name: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(name) ? name.split("@")[0] : name;
  };

  return (
    <header className="relative flex h-12 items-center justify-between border-b px-4">
      {/* Left: Sidebar toggle */}
      <div className="flex items-center z-10">
        <SidebarTrigger className="mr-2" />
      </div>

      {/* Center: Greeting + Timestamp */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden sm:block">
        {profileData && profileData.name ? (
          <span className="text-md text-foreground font-semibold flex items-center gap-1">
            <Icon
              className={`w-4 h-4 ${
                hour < 15 ? "text-yellow-400" : "text-blue-800"
              }`}
            />
            {greeting}, {getDisplayName(profileData.name)} | {formattedDate} | {formattedTime}
          </span>
        ) : null}
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
            <AvatarImage
              src={
                profileData?.picture?.startsWith("/uploads")
                  ? `http://localhost:3001${profileData.picture}`
                  : "/default.png"
              }
              className="border border-muted-foreground rounded-full"
              alt="User Profile"
            />
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
