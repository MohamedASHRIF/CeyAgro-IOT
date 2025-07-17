// "use client";

// import DevicePage from "../(components)/viewDevice";
// import { DeviceHeader } from "../(components)/viewDeviceHeader";
// import { useParams } from "next/navigation";

// export default function DeviceManagementPage() {
//   const params = useParams();
//   const deviceId = params.deviceID as string; // Note: deviceID matches your folder [deviceID]

//   return (
//     <div className="device-management-page">
//       <DeviceHeader 
//         activeTab="Device Information" 
//         deviceId={deviceId} 
//       />
      
//       {/* Your device content here */}
//       <div className="mt-4">
//         <DevicePage/>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import DevicePage from "../(components)/viewDevice";
import { DeviceHeader } from "../(components)/viewDeviceHeader";
import { useParams } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { DeviceTable } from "../(components)/DataTable";
import { AddDeviceForm } from "../(components)/DeviceForm";

export default function DeviceManagementPage() {
  const params = useParams();
  const deviceId = params.deviceID as string;

  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState("Device Information");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "add-device") setActiveTab("Add New Device");
    else if (hash === "all-devices") setActiveTab("All Devices");
    else setActiveTab("Device Information");
  }, []);

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div
          className="flex items-center justify-center h-screen"
          role="status"
          aria-label="Loading"
        >
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    if (!user || !user.email) {
      return <p>User not authenticated or missing email.</p>;
    }

    switch (activeTab) {
      case "Device Information":
        return <DevicePage deviceId={deviceId} userEmail={user.email} />;
      case "All Devices":
        return <DeviceTable userEmail={user.email} />;
      case "Add New Device":
        return <AddDeviceForm email={user.email}/>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  ;
  }

  if (!user || !user.email) {
    return <p>User not authenticated or missing email.</p>;
  }

  return (
    <div className="device-management-page">
      <DeviceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAllTabs={true}
        deviceId={deviceId}
      />
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
}
