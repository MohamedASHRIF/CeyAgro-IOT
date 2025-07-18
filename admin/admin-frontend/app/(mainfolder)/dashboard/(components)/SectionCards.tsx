'use client'; // Mark this file as a client-side component

import * as React from 'react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define the type for the stats prop
interface SectionCardsProps {
  stats: {
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    devices: {
      total: number;
      active: number;
      inactive: number;
    };
  };
}

// Functional component accepting props
export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4 gap-4 px-4 lg:px-6 p-20">
      {/* Total Users */}
      <Card className="bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-4">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Total Users
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.users.total}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Total number of Users registered
          </div>
        </CardFooter>
      </Card>

      {/* Active Users */}
      <Card className="bg-[#B5F6B2] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Active Users
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.users.active}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Number of Currently Active Users
          </div>
        </CardFooter>
      </Card>

      {/* Inactive Users */}
      <Card className=" bg-[#FF97978A] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Inactive Users
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.users.inactive}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Number of Currently Inactive Users
          </div>
        </CardFooter>
      </Card>

      {/* Total Devices */}
      <Card className="bg-[#FFD9666E] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Total Devices
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.devices.total}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Total number of Devices registered
          </div>
        </CardFooter>
      </Card>

      {/* Active Devices */}
      <Card className="bg-[#B5F6B2] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Active Devices
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.devices.active}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Number of Currently Active Devices
          </div>
        </CardFooter>
      </Card>

      {/* Inactive Devices */}
      <Card className=" bg-[#FF97978A] transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl rounded-4xl pt-2 gap-2">
        <CardHeader className="relative flex flex-col justify-center items-center text-center">
          <CardDescription className="text-4xl font-semibold">
            Inactive Devices
          </CardDescription>
          <CardTitle className="text-5xl font-semibold tabular-nums">
            {stats.devices.inactive}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-center">
          <div className="text-muted-foreground">
            Number of Currently Inactive Devices
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
