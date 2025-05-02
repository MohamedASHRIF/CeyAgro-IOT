'use client'; // Ensure the component is treated as a client component

import { useState, useEffect } from 'react';
import UserSelect from './(components)/UserSelect';
import DeviceList from './(components)/DeviceList';

// Define the types for User and Device
interface User {
  id: string;
  name: string;
}

interface Device {
  id: string;
  name: string;
  status: string;
  userId: string;
}

export default function DeviceManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users data from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
        );
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch devices data from the API based on selected user
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const url = selectedUserId
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/user/${selectedUserId}`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/devices`;
        const response = await fetch(url);
        const data = await response.json();
        setDevices(data);
      } catch (err) {
        console.error('Failed to fetch devices', err);
      }
    };

    fetchDevices();
  }, [selectedUserId]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="p-10 space-y-10">
      <div className="space-y-1">
        <UserSelect users={users} onSelect={setSelectedUserId} />
      </div>
      <DeviceList
        devices={devices}
        selectedUserId={selectedUserId}
        userName={selectedUser?.name}
      />
    </div>
  );
}
