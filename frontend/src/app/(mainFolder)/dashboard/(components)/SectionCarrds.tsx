/*import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
      <Card className="bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">
            Total Devices
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            10
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col  gap-1 text-md ">
          Total number of devices registered
        </CardFooter>
      </Card>

      <Card className="bg-[#B5F6B2] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">
            Active Devices
          </CardDescription>
          <CardTitle className="text-4xl  tabular-nums pt-2">
            08
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-1 text-md ">
          Number of Currently Active devices
        </CardFooter>
      </Card>

      <Card className=" bg-[#FF97978A] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl ">
            Inactive Devices
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            02
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col  gap-1 text-md">
          Number of Currently Inactive devices
        </CardFooter>
      </Card>
    </div>
  );
}
*/

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
  // Keep this optional if you want fallback or manual userId
  userId?: string;
}

interface DeviceStatistics {
  total: number;
  active: number;
  inactive: number;
  loading: boolean;
  error: string | null;
}

export function SectionCards(props: SectionCardsProps = {}) {
  const { user, isLoading } = useUser();

  // Store fetched userId here
  const [userId, setUserId] = useState<string | undefined>(props.userId);

  const [statistics, setStatistics] = useState<DeviceStatistics>({
    total: 0,
    active: 0,
    inactive: 0,
    loading: true,
    error: null,
  });

  // Fetch user ID from email if no userId prop passed


useEffect(() => {
  if (!isLoading && user?.email && !userId) {
    fetch(`http://localhost:3001/user/id-by-email/${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        console.log('Response data:', data);
        if (data.userId) {
          setUserId(data.userId);
        } else {
          console.error('User ID not found in response', data);
        }
      })
      .catch(err => console.error('Failed to fetch user ID:', err));
  }
}, [isLoading, user, userId]);


  // Fetch device statistics from backend when userId changes
  const fetchDeviceStatistics = async () => {
    if (!userId) {
      setStatistics((prev) => ({
        ...prev,
        loading: false,
        error: "User ID is required",
      }));
      return;
    }

    try {
      setStatistics((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `http://localhost:3002/device-user/statistics?userId=${userId}`
      );

      const result = await response.json();

      if (result.success) {
        setStatistics({
          total: result.data.total || 0,
          active: result.data.active || 0,
          inactive: result.data.inactive || 0,
          loading: false,
          error: null,
        });
      } else {
        setStatistics((prev) => ({
          ...prev,
          loading: false,
          error: result.message || "Failed to fetch statistics",
        }));
      }
    } catch (error) {
      setStatistics((prev) => ({
        ...prev,
        loading: false,
        error: "Network error: Could not fetch device statistics",
      }));
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDeviceStatistics();
    }
  }, [userId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(fetchDeviceStatistics, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // *** THE REST IS YOUR ORIGINAL LAYOUT AND JSX BELOW ***

  if (statistics.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="bg-gray-100 animate-pulse rounded-4xl pt-2 gap-2"
          >
            <CardHeader className="relative flex flex-col justify-center items-center text-center">
              <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-12 bg-gray-300 rounded w-16"></div>
            </CardHeader>
            <CardFooter className="flex-col gap-1">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (statistics.error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
        <Card className="bg-red-50 border-red-200 rounded-4xl pt-2 gap-2 col-span-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error Loading Statistics</CardTitle>
            <CardDescription className="text-red-500">
              {statistics.error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <button
              onClick={fetchDeviceStatistics}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
      <Card className="bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">Total Devices</CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            {statistics.total.toString().padStart(2, "0")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-1 text-md">
          Total number of devices registered
        </CardFooter>
      </Card>

      <Card className="bg-[#B5F6B2] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">Active Devices</CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            {statistics.active.toString().padStart(2, "0")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-1 text-md">
          Number of Currently Active devices
        </CardFooter>
      </Card>

      <Card className="bg-[#FF97978A] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-2xl text-3xl">Inactive Devices</CardDescription>
          <CardTitle className="text-4xl tabular-nums pt-2">
            {statistics.inactive.toString().padStart(2, "0")}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col gap-1 text-md">
          Number of Currently Inactive devices
        </CardFooter>
      </Card>

      {/* Refresh indicator */}
      <div className="col-span-full flex justify-center mt-4">
        <button
          onClick={fetchDeviceStatistics}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          disabled={statistics.loading}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Statistics
        </button>
      </div>
    </div>
  );
}
