
"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SunIcon, MoonIcon, BellRing } from "lucide-react";

export const DashboardHeader = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hour = time.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

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

  return (
    <header className="relative flex h-11 items-center justify-between border-b px-4">
      {/* Left: Sidebar toggle */}
      <div className="flex items-center z-10">
        <SidebarTrigger className="mr-2" />
      </div>

      {/* Center: Greeting + Timestamp */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center hidden sm:block">
        <span className="text-md text-foreground flex items-center gap-1">
          <Icon
            className={`w-4 h-4 ${
              hour < 18 ? "text-yellow-400" : "text-blue-800"
            }`}
          />
          {greeting}, User Name | {formattedDate} | {formattedTime}
        </span>
      </div>

      {/* Right: Notification + Avatar */}
      <div className="flex items-center gap-6 z-10 pr-4">
        <button className="relative p-1 rounded-md">
          <BellRing className="w-5 h-5 text-gray-500 hover:text-teal-600 transition-colors duration-200 cursor-pointer" />
        </button>

        <div className="h-6 w-px bg-gray-300" />
        <Avatar className="h-8 w-8 ml-2 cursor-pointer">
          <AvatarImage src="https://github.com/shadcn.png" alt="User profile" />
          <AvatarFallback>IMG</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
