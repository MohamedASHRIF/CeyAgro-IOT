"use client";

interface DashboardHeaderProps {
  activeTab: string | null;
  onTabChange: (tab: string) => void;
}

import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

export function DashboardHeader({
  activeTab,
  onTabChange,
}: DashboardHeaderProps) {
  return (
    <GreenHeader
      title="Dashboard"
      menuItems={[
        {
          name: "Active Devices",
          onClick: () => onTabChange("Active Devices"),
          isActive: activeTab === "Active Devices",
        },
        {
          name: "Inactive Devices",
          onClick: () => onTabChange("Inactive Devices"),
          isActive: activeTab === "Inactive Devices",
        },
        {
          name: "View All Devices",
          onClick: () => onTabChange("View All Devices"),
          isActive: activeTab === "View All Devices",
        },
      ]}
    />
  );
}
