'use client';

import * as React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ChartDataPoint = {
  dateTime: string; // Full date and time (for every 3h)
  activeUsers: number;
  activeDevices: number;
};

// Helper to format current date and time
const getFormattedDateTime = (): string => {
  const date = new Date();
  return date.toISOString().replace('T', ' ').substring(0, 16); // "YYYY-MM-DD HH:mm"
};

const ChartComponent: React.FC = () => {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:3001/dashboard/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch data from backend');
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        const { activeUsers, activeDevices } = data;

        const newData: ChartDataPoint = {
          dateTime: getFormattedDateTime(),
          activeUsers,
          activeDevices,
        };

        setChartData((prevData) => [...prevData, newData]);
      } catch (error: any) {
        console.error('Error fetching chart data:', error.message);
        setError(
          error.message || 'An error occurred while fetching chart data.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

    // Set interval to fetch every 3 hours
    const intervalId = setInterval(fetchChartData, 3 * 60 * 60 * 1000); // 3h in ms

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users & Devices (Every 3 Hours)</CardTitle>
        <CardDescription>Chart updates automatically every 3h</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateTime"
                hide={isMobile}
                tickFormatter={(value) => value.slice(5)} // Show MM-DD HH:mm
              />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#8884d8"
                fill="#8884d8"
                name="Active Users"
              />
              <Area
                type="monotone"
                dataKey="activeDevices"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Active Devices"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
