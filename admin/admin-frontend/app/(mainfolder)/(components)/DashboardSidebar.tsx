'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LogOutIcon,
  Settings,
  User,
  MapPinCheckIcon,
  User2,
  Bell,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'User Management', url: '/users', icon: User2 },
  { title: 'Device Management', url: '/devices', icon: MapPinCheckIcon },
  { title: 'notification', url: '/notification', icon: Bell },
  { title: 'Messeage', url: '#', icon: MessageCircle },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      {
        title: 'Profile Management',
        url: '/Settings/profileManagement',
        icon: User,
      },
      // { title: "Change Password", url: "/change-password", icon: Key },
      // { title: "Delete Account", url: "/delete-account", icon: Trash },
    ],
  },
  // No logout in this array
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Sidebar>
      <SidebarHeader className="h-14 border-b">
        <div className="flex items-center space-x-2">
          <Image src="/4.png" alt="Logo" width={160} height={12} />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-grow">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;

                if (item.children) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => setSettingsOpen((prev) => !prev)}
                          className={`flex w-full items-center space-x-2 px-4 py-2 cursor-pointer ${
                            settingsOpen
                              ? 'font-bold text-black'
                              : 'text-gray-800'
                          }`}
                        >
                          <item.icon />
                          <span className="text-base">{item.title}</span>
                        </button>
                      </SidebarMenuButton>

                      {settingsOpen && (
                        <div className="pl-10 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.url;
                            return (
                              <Link
                                key={child.title}
                                href={child.url}
                                className={`flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 ${
                                  isChildActive
                                    ? 'font-semibold text-gray-800 bg-white'
                                    : 'text-gray-700'
                                }`}
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
                            ? 'font-bold text-black hover:text-inherithover:bg-transparent'
                            : 'text-gray-800'
                        }`}
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

        {/* Move the Logout item to the bottom */}
        <SidebarFooter className="mt-auto">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/user/login"
                className="flex items-center space-x-2 px-4 py-2 cursor-pointer text-gray-800 hover:text-black"
              >
                <LogOutIcon />
                <span className="text-base">Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
