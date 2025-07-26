// "use client";

// import { usePathname } from "next/navigation";
// import {
//   ChartAreaIcon,
//   LayoutDashboard,
//   LogOutIcon,
//   Monitor,
//   Settings,
//   User,
//   MapPinCheckIcon,
//   LetterText,
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useState, useEffect } from "react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";

// const items = [
//   { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
//   { title: "Device Management", url: "/devices", icon: Monitor },
//   { title: "Location Management", url: "/location", icon: MapPinCheckIcon },
//   { title: "Visualization", url: "/device-visualization", icon: ChartAreaIcon },
//   { title: "Reports", url: "/report", icon: LetterText },
//   {
//     title: "Settings",
//     icon: Settings,
//     children: [
//       {
//         title: "Profile Management",
//         url: "/Settings/profileManagement",
//         icon: User,
//       },
//     ],
//   },
// ];

// export function DashboardSidebar() {
//   const pathname = usePathname();

//   // Determine if any settings children match the current route
//   const isAnySettingsChildActive = items
//     .find((item) => item.title === "Settings")
//     ?.children?.some((child) => pathname === child.url);

//   const [settingsOpen, setSettingsOpen] = useState(
//     isAnySettingsChildActive ?? false
//   );

//   useEffect(() => {
//     if (isAnySettingsChildActive) {
//       setSettingsOpen(true);
//     }
//   }, [pathname, isAnySettingsChildActive]);

//   return (
//     <Sidebar>
//       <SidebarHeader className="h-14 border-b">
//         <div className="flex items-center space-x-2">
//           <Image src="/4.png" alt="Logo" width={160} height={12} />
//         </div>
//       </SidebarHeader>

//       <SidebarContent className="flex flex-col h-full">
//         <SidebarGroup className="flex-grow">
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => {
//                 const isActive = pathname === item.url;
//                 const isSettingsActive =
//                   item.title === "Settings" &&
//                   (pathname === item.url ||
//                     item.children?.some((child) => pathname === child.url));

//                 if (item.children) {
//                   return (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton
//                         onClick={() => setSettingsOpen((prev) => !prev)}
//                         className={`flex w-full items-center space-x-2 px-4 py-2 cursor-pointer ${
//                           isSettingsActive
//                             ? "font-bold text-black"
//                             : "text-gray-800"
//                         }`}
//                       >
//                         <item.icon />
//                         <span className="text-base">{item.title}</span>
//                       </SidebarMenuButton>

//                       {settingsOpen && (
//                         <div className="pl-10 mt-1 space-y-1">
//                           {item.children.map((child) => {
//                             const isChildActive = pathname === child.url;
//                             return (
//                               <Link
//                                 key={child.title}
//                                 href={child.url}
//                                 className={`flex items-center space-x-2 px-2 py-1 rounded hover:text-teal-400 ${
//                                   isChildActive
//                                     ? "font-semibold text-gray-700"
//                                     : "text-gray-700"
//                                 }`}
//                                 onClick={() => setSettingsOpen(true)}
//                               >
//                                 <child.icon className="h-4 w-4" />
//                                 <span className="text-base">{child.title}</span>
//                               </Link>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </SidebarMenuItem>
//                   );
//                 }

//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild>
//                       <Link
//                         href={item.url}
//                         className={`flex items-center space-x-2 px-4 py-2 cursor-pointer ${
//                           isActive
//                             ? "font-bold text-black hover:text-inherit hover:bg-transparent"
//                             : "text-gray-800"
//                         }`}
//                         onClick={() => setSettingsOpen(false)}
//                       >
//                         <item.icon />
//                         <span className="text-base">{item.title}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         <SidebarFooter className="mt-auto">
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild>
//               <Link
//                 href="/api/auth/login"
//                 className="flex items-center space-x-2 px-4 py-2 cursor-pointer text-gray-800 hover:text-black"
//                 onClick={() => setSettingsOpen(false)}
//               >
//                 <LogOutIcon />
//                 <span className="text-base">Logout</span>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarFooter>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChartAreaIcon,
  LayoutDashboard,
  LogOutIcon,
  Monitor,
  Settings,
  User,
  Logs,
  MapPinCheckIcon,
  LetterText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client"; // Import useUser for client-side auth
import { logout } from "../../../../actions/auth"; // Only import logout since login is not used

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Device Management", url: "/devices", icon: Monitor },
  { title: "Location Management", url: "/location", icon: MapPinCheckIcon },
  { title: "Visualization", url: "/device-visualization", icon: ChartAreaIcon },
  { title: "Reports", url: "/report", icon: LetterText },
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Profile Management",
        url: "/Settings/profileManagement",
        icon: User,
      },
      {
        title: "Activity Log",
        url: "/Settings/activity-log",
        icon: Logs,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser(); // Get user and loading state from Auth0
  const isAuthenticated = !!user; // Determine authentication status

  // Determine if any settings children match the current route
  const isAnySettingsChildActive = items
    .find((item) => item.title === "Settings")
    ?.children?.some((child) => pathname === child.url);

  const [settingsOpen, setSettingsOpen] = useState(
    isAnySettingsChildActive ?? false
  );

  useEffect(() => {
    if (isAnySettingsChildActive) {
      setSettingsOpen(true);
    }
  }, [pathname, isAnySettingsChildActive]);

  const handleLogout = async () => {
    await logout(); // Call server action
    router.refresh(); // Refresh UI to reflect logout
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-20 border-b">
        <div className="flex items-center space-x-2">
          <Image
            src="/image.png"
            alt="Logo"
            width={70}
            height={50}
            className="mx-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-grow">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.title === "Device Management"
                    ? pathname.startsWith("/devices")
                    : pathname === item.url;

                const isSettingsActive =
                  item.title === "Settings" &&
                  (pathname === item.url ||
                    item.children?.some((child) => pathname === child.url));

                if (item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        className={`flex w-full items-center space-x-2 px-4 py-2 cursor-pointer ${
                          isSettingsActive
                            ? "font-bold text-black"
                            : "text-gray-800"
                        }`}
                      >
                        <item.icon />
                        <span className="text-base">{item.title}</span>
                      </SidebarMenuButton>

                      {settingsOpen && (
                        <div className="pl-10 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.url;
                            return (
                              <Link
                                key={child.title}
                                href={child.url}
                                className={`flex items-center space-x-2 px-2 py-1 rounded hover:text-teal-400 ${
                                  isChildActive
                                    ? "font-semibold text-gray-700"
                                    : "text-gray-700"
                                }`}
                                onClick={() => setSettingsOpen(true)}
                              >
                                <child.icon className="h-4 w-4" />
                                <span className="text-base">{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer ${
                          isActive
                            ? "font-bold text-black hover:text-inherit hover:bg-transparent"
                            : "text-gray-800"
                        }`}
                        onClick={() => setSettingsOpen(false)}
                      >
                        <item.icon />
                        <span className="text-base">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="mt-auto">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {isAuthenticated && (
                <form action={logout}>
                  <button
                    onClick={handleLogout}
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 cursor-pointer text-gray-800 hover:text-black"
                  >
                    <LogOutIcon />
                    <span className="text-base">Logout</span>
                  </button>
                </form>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
