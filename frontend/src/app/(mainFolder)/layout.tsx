// "use client";

// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { DashboardSidebar } from "./(components)/DashboardSidebar";
// import { DashboardHeader } from "./(components)/mainHeader";
// import Footer from "./(components)/footer";

// export default function CommonLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <div className="flex">
//       <SidebarProvider>
//         <DashboardSidebar />
//         <SidebarInset>
//           <DashboardHeader />
//           <main className="flex-1">{children}</main>
//           <Footer />
//         </SidebarInset>
//       </SidebarProvider>
//     </div>
//   );
// }

"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./(components)/DashboardSidebar";
import { DashboardHeader } from "./(components)/mainHeader";
import Footer from "./(components)/footer";

export default function CommonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen flex">
    
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300 ">{children}</main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}