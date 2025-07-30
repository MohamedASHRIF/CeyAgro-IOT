'use client'; // Mark this file as a client-side component

import * as React from 'react';
import { useEffect, useState } from 'react';

// Components
import { SectionCards } from './(components)/SectionCards'; // Correct named import
import ChartComponent from './(components)/chart'; // Default import

// Type for the API response
type DashboardStats = {
  totalUsers: number;
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Fetch the data from your backend API
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }

    fetchStats();
  }, []);

  // Loading state while waiting for stats
  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-0">
      {/* Section Cards */}
      <SectionCards
        stats={{
          users: {
            total: stats.totalUsers,
            active: stats.totalUsers - stats.inactiveDevices, // Estimate active users if not provided
            inactive: stats.inactiveDevices,
          },
          devices: {
            total: stats.totalDevices,
            active: stats.activeDevices,
            inactive: stats.inactiveDevices,
          },
        }}
      />

      {/* Chart Area */}
      <div className="bg-gray-300 rounded-2x0.5 shadow-md p-5">
        <h2 className="text-2xl font-semibold mb-4">
          Users and Devices Overview
        </h2>
        <ChartComponent /> {/* Passing the original stats */}
      </div>
    </div>
  );
}
