"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

interface DeviceHeaderProps {
  onTabChange: (tab: string | null) => void;
  activeTab: string | null;
}

export function DeviceHeader({ onTabChange, activeTab }: DeviceHeaderProps) {
  const router = useRouter();

  // Sync tab and URL hash
  const handleTabChange = (tab: string, hash: string) => {
    onTabChange(tab);
    router.push(`#${hash}`);
  };

  // On first load, check URL hash and set tab
  useEffect(() => {
  const hash = window.location.hash.replace("#", "");
  if (hash === "all-devices") onTabChange("All Devices");
  else if (hash === "add-device") onTabChange("Add New Device");
  //else if (hash === "device-access") onTabChange("Device Access");
}, [onTabChange]);

  return (
  <div className="mt-20">
  <GreenHeader
    title="Device Management"
    menuItems={[
      {
        name: "All Devices",
        onClick: () => handleTabChange("All Devices", "all-devices"),
        isActive: activeTab === "All Devices",
      },
      {
        name: "Add New Device",
        onClick: () => handleTabChange("Add New Device", "add-device"),
        isActive: activeTab === "Add New Device",
      },
    ]}
  />
</div>

  );
}
