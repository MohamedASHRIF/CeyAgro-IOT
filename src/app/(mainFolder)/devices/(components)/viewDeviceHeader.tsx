// "use client";

// import { FC } from "react";
// import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";

// interface DeviceHeaderProps {
//   activeTab: string;
//   deviceId: string;
// }

// export const DeviceHeader: FC<DeviceHeaderProps> = ({ activeTab, deviceId }) => {
//   return (
//     <GreenHeader
//       title={`Device Management`}
//       menuItems={[
//         {
//           name: "Device Information",
//           onClick: () => {},
//           isActive: activeTab === "Device Information",
//         },
//       ]}
//     />
//   );
// };





"use client";

import { FC, useEffect } from "react";
import GreenHeader from "@/app/(mainFolder)/(components)/greenHeader";
import { useRouter } from "next/navigation";

interface DeviceHeaderProps {
  activeTab: string;
  deviceId?: string; // optional in case it's not on device detail page
  onTabChange?: (tab: string) => void; // optional for detail page that doesn't control state
  showAllTabs?: boolean; // new flag
}

export const DeviceHeader: FC<DeviceHeaderProps> = ({
  activeTab,
  deviceId,
  onTabChange,
  showAllTabs = false, // default: false
}) => {
  const router = useRouter();

  const handleTabChange = (tab: string, hash: string) => {
    onTabChange?.(tab); // only call if provided
    router.push(`#${hash}`);
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "all-devices") onTabChange?.("All Devices");
    else if (hash === "add-device") onTabChange?.("Add New Device");
  }, [onTabChange]);

  const menuItems = [
    {
      name: "Device Information",
      onClick: () => onTabChange?.("Device Information"),
      isActive: activeTab === "Device Information",
    },
  ];

  if (showAllTabs) {
    menuItems.push(
      {
        name: "All Devices",
        onClick: () => handleTabChange("All Devices", "all-devices"),
        isActive: activeTab === "All Devices",
      },
      {
        name: "Add New Device",
        onClick: () => handleTabChange("Add New Device", "add-device"),
        isActive: activeTab === "Add New Device",
      }
    );
  }

  return <GreenHeader title="Device Management" menuItems={menuItems} />;
};
