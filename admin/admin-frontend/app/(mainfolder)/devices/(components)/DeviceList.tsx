/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define the types for Device
interface Device {
  id: string;
  name: string;
  status: string;
  userId: string;
}

interface DeviceListProps {
  devices: Device[];
  selectedUserId: string | null;
  userName?: string;
}

export default function DeviceList({
  devices,
  selectedUserId,
  userName,
}: DeviceListProps) {
  return (
    <div>
      <h2>Devices for {userName ? userName : 'All Users'}</h2>
      {devices.length === 0 ? (
        <p>No devices found for this user.</p>
      ) : (
        devices.map((device) => (
          <Card key={device.id} className="mb-4">
            <CardHeader>
              <CardTitle>{device.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {device.status}</p>
              <p>User ID: {device.userId}</p>
            </CardContent>
            <CardFooter>
              <Button>Manage</Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
