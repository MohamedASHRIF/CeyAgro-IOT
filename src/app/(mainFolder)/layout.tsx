"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./(components)/DashboardSidebar";
import { DashboardHeader } from "./(components)/mainHeader";
import Footer from "./(components)/footer";

export default function CommonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 bg-gray-100">{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
