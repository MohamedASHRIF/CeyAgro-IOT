"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import LocationFlowVisualization from "../(components)/LocationFlowVisualization";
import { ReactFlowProvider } from "reactflow";

interface DeviceLocation {
  name: string;
  location: string;
  _id?: string;
}

export default function Home() {
  const { user, isLoading: isAuthLoading } = useUser();
  const [deviceLocations, setDeviceLocations] = useState<DeviceLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<DeviceLocation | null>(null);
  const [editForm, setEditForm] = useState({ location: '' });

  const fetchDeviceLocations = useCallback(async () => {
    if (!user?.email) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3002/device-user/locations?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const { data } = await response.json();
        if (!Array.isArray(data)) {
          console.error('Invalid response format: data is not an array', data);
          return;
        }
        const formattedData: DeviceLocation[] = data.map((item: any) => ({
          name: item.deviceName,
          location: item.location || 'Location not set',
          _id: item.deviceId,
        }));
        console.log('Fetched device locations:', formattedData);
        setDeviceLocations(formattedData);
      } else {
        console.error("Failed to fetch user locations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user locations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthLoading && user?.email) {
      fetchDeviceLocations();
    }
  }, [fetchDeviceLocations, isAuthLoading, user?.email]);

  const handleEditClick = (device: DeviceLocation) => {
    console.log('Editing device:', device);
    setEditingDevice(device);
    setEditForm({ location: device.location });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice?._id || !user?.email) return;

    try {
      const response = await fetch(
        `http://localhost:3002/device-user/${editingDevice._id}/location?email=${encodeURIComponent(user.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: editForm.location,
          }),
        }
      );

      if (response.ok) {
        await fetchDeviceLocations(); // Re-fetch to update UI
        setEditingDevice(null);
        setEditForm({ location: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to update device location (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Error updating device location:", error);
      alert("Error updating device location");
    }
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
    setEditForm({ location: '' });
  };

  useEffect(() => {
    console.log('Updated deviceLocations:', deviceLocations);
  }, [deviceLocations]);

  if (isAuthLoading) {
    return <p>Loading user information...</p>;
  }

  if (!user) {
    return <p>Please log in to view your devices.</p>;
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Device Location Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Registered Devices for {user.name || user.email}</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : deviceLocations.length === 0 ? (
              <p>No devices registered for this user.</p>
            ) : (
              <ul className="space-y-3">
                {deviceLocations.map((device) => (
                  <li key={device._id} className="bg-gray-100 p-3 rounded">
                    {editingDevice?._id === device._id ? (
                      <form onSubmit={handleEditSubmit} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-700">{device.name}:</strong>
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ location: e.target.value })}
                            className="flex-1 p-2 border rounded"
                            placeholder="Location"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{device.name}</strong>: {device.location}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(device)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold mb-4">
              Location Visualization
            </h2>
            {deviceLocations.length === 0 ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500">
                  No device locations to visualize for this user.
                </p>
              </div>
            ) : (
              <ReactFlowProvider>
                <LocationFlowVisualization data={deviceLocations} key={JSON.stringify(deviceLocations)} />
              </ReactFlowProvider>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}