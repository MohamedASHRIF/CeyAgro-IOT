import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./(components)/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function CommonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <SidebarProvider>
        {/* Sidebar rendered once here */}
        <DashboardSidebar />
        <SidebarInset>
          <header className=" flex h-14 items-center justify-between border-b-1 px-4">
            {/* Left: Sidebar toggle */}
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
            </div>

            {/* Center: Search bar */}
            <div className="flex w-full max-w-sm items-center justify-center mx-auto">
              <Input type="text" placeholder="Search..." className="w-full" />
            </div>

            {/* Right: Notification + Avatar */}
            <div className="flex items-center gap-3">
              {/* Notification icon (optional badge can be added later) */}
              <button className="relative p-1 rounded-md ">
                <Bell className="w-5 h-5 text-gray-700 hover:text-[hsl(172.5,_66%,_50.4%)] transition-colors duration-200" />
              </button>

              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="User profile"
                />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>

              {/* User name (hidden on small screens) */}
              <span className="text-sm font-medium hidden sm:inline-block">
                User Name
              </span>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 bg-gray-100">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
