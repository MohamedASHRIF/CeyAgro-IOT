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

interface DeviceStatistics {
  total: number;
  active: number;
  inactive: number;
  loading: boolean;
  error: string | null;
}

export function SectionCards() {
  const { user, isLoading } = useUser();

  const [statistics, setStatistics] = useState<DeviceStatistics>({
    total: 0,
    active: 0,
    inactive: 0,
    loading: true,
    error: null,
  });

  // For fade-in effect
  const [visibleCards, setVisibleCards] = useState([false, false, false]);

  const fetchDeviceStatistics = async (email: string) => {
    try {
      setStatistics((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `http://localhost:3002/device-user/statistics?email=${encodeURIComponent(email)}`
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
    if (!isLoading && user?.email) {
      fetchDeviceStatistics(user.email);
    }
  }, [isLoading, user]);

  // Auto-refresh every 60 seconds (60000 ms)
  useEffect(() => {
    if (!user?.email) return;

    const interval = setInterval(() => {
      fetchDeviceStatistics(user.email!);
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Fade-in effect for cards
  useEffect(() => {
    if (!statistics.loading && !statistics.error) {
      setVisibleCards([false, false, false]);
      const timers: NodeJS.Timeout[] = [];
      [0, 1, 2].forEach((idx) => {
        timers.push(
          setTimeout(() => {
            setVisibleCards((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }, idx * 200) // 200ms stagger
        );
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [statistics.loading, statistics.error]);

  // Spinner while loading
  if (statistics.loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (statistics.error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
        <Card className="bg-red-50 border-red-200 rounded-4xl pt-2 gap-2 col-span-full opacity-100 transition-opacity duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error Loading Statistics</CardTitle>
            <CardDescription className="text-red-500">
              {statistics.error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <button
              onClick={() => user?.email && fetchDeviceStatistics(user.email)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Devices",
      value: statistics.total,
      bg: "bg-[#FFD9666E]",
      desc: "Total number of devices registered",
    },
    {
      label: "Active Devices",
      value: statistics.active,
      bg: "bg-[#B5F6B2]",
      desc: "Number of Currently Active devices",
    },
    {
      label: "Inactive Devices",
      value: statistics.inactive,
      bg: "bg-[#FF97978A]",
      desc: "Number of Currently Inactive devices",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
      {cards.map((card, idx) => (
        <Card
          key={card.label}
          className={`${card.bg} transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2 transition-opacity duration-500 ${
            visibleCards[idx] ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <CardHeader className="relative flex flex-col justify-center items-center text-center">
            <CardDescription className="text-2xl text-3xl">{card.label}</CardDescription>
            <CardTitle className="text-4xl tabular-nums pt-2">
              {card.value.toString().padStart(2, "0")}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col gap-1 text-md">
            {card.desc}
          </CardFooter>
        </Card>
      ))}

      {/* Refresh indicator */}
      <div className="col-span-full flex justify-center mt-4 opacity-100 transition-opacity duration-500">
        <button
          onClick={() => user?.email && fetchDeviceStatistics(user.email)}
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