"use client";

import DevicePage from "../(components)/viewDevice";
import { DeviceHeader } from "../(components)/viewDeviceHeader";
import { useParams } from "next/navigation";

export default function DeviceManagementPage() {
  const params = useParams();
  const deviceId = params.deviceID as string; // Note: deviceID matches your folder [deviceID]

  return (
    <div className="device-management-page">
      <DeviceHeader 
        activeTab="Device Information" 
        deviceId={deviceId} 
      />
      
      {/* Your device content here */}
      <div className="mt-4">
        <DevicePage/>
      </div>
    </div>
  );
}