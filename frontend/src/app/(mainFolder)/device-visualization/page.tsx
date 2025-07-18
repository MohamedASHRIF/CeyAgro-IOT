"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RealTimeChart } from "./(components)/RealTimeChart";
import { HistoryChart } from "./(components)/HistoryChart";
import { DynamicChart } from "./(components)/DynamicChart";
import { AnomalyChart } from "./(components)/AnomalyChart";
import { ComparisonChart } from "./(components)/ComparisonChart";
import { CorrelationChart } from "./(components)/CorrelationChart";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";


export default function VisualizationPage() {
  const { user, isLoading } = useUser();
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [metrics] = useState<string[]>(["temperature", "humidity"]);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "humidity" | null>(null);
  const [timeRange, setTimeRange] = useState<"lastHour" | "lastDay">("lastHour");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !user.email) return;
    setIsLoadingDevices(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-devices`, {
        params: { email: user.email },
      })
      .then((response) => {
        if (!response.data.success || !Array.isArray(response.data.data) || response.data.data.length === 0) {
          setError("No devices found");
          setIsLoadingDevices(false);
          return;
        }
        setDevices(response.data.data);
        setSelectedDevice(response.data.data[0]);
        setSelectedMetric("temperature");
        setIsLoadingDevices(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch devices");
        setIsLoadingDevices(false);
      });
  }, [user]);

  // Handler for metric selection changes
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value as "temperature" | "humidity");
  };

  // Handler for time range selection changes
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "lastHour" | "lastDay");
  };

  // Debug: log selectedDevice and selectedMetric
  console.log('Dashboard selectedDevice:', selectedDevice, 'selectedMetric:', selectedMetric);
  if (selectedDevice && selectedMetric) {
    console.log('Rendering HistoryChart', { device: selectedDevice, metric: selectedMetric, timeRange });
    console.log('Rendering DynamicChart', { device: selectedDevice, metric: selectedMetric, timeRange });
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p>Loading devices...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-6">
      {/* Top controls */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedDevice || ""} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device} value={device}>
                {device}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMetric || ""} onValueChange={handleMetricChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Metric" />
          </SelectTrigger>
          <SelectContent>
            {metrics.map((metric) => (
              <SelectItem key={metric} value={metric}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastHour">Last Hour</SelectItem>
            <SelectItem value="lastDay">Last Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}

      {/* Main charts grid */}
      {selectedDevice && selectedMetric ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Real-time (now first) */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Real-Time</CardTitle></CardHeader>
            <CardContent>
              <RealTimeChart
                key={`realtime-${selectedDevice}-${selectedMetric}`}
                device={selectedDevice}
                metric={selectedMetric}
                currentTime={currentTime}
              />
            </CardContent>
          </Card>
          {/* Trend/History (now second) */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Trend (Last 24h)</CardTitle></CardHeader>
            <CardContent>
              <HistoryChart
                key={`history-${selectedDevice}-${selectedMetric}-${timeRange}`}
                device={selectedDevice}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
          {/* Dynamic/Stats */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Statistics (Min/Max/Avg)</CardTitle></CardHeader>
            <CardContent>
              <DynamicChart
                key={`dynamic-${selectedDevice}-${selectedMetric}-${timeRange}`}
                device={selectedDevice}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
          {/* Anomaly Detection */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Anomaly Detection</CardTitle></CardHeader>
            <CardContent>
              <AnomalyChart
                device={selectedDevice}
                metric={selectedMetric}
                startDate={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                endDate={new Date().toISOString()}
              />
            </CardContent>
          </Card>
          {/* Comparison */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Device Comparison</CardTitle></CardHeader>
            <CardContent>
              {devices.length >= 2 ? (
                <ComparisonChart
                  deviceA={devices[0]}
                  deviceB={devices[1]}
                  metric={selectedMetric}
                  startDateA={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                  endDateA={new Date().toISOString()}
                  startDateB={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                  endDateB={new Date().toISOString()}
                />
              ) : (
                <div className="text-gray-400 text-center">Need at least 2 devices</div>
              )}
            </CardContent>
          </Card>
          {/* Correlation */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Correlation (Temp vs. Humidity)</CardTitle></CardHeader>
            <CardContent>
              <CorrelationChart
                device={selectedDevice}
                startDate={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                endDate={new Date().toISOString()}
              />
            </CardContent>
          </Card>
          {/* Forecasting (placeholder) */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Forecast</CardTitle></CardHeader>
            <CardContent>
              <div className="text-gray-400 text-center">Coming soon</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent>
            <p>Please select a device and metric to view charts.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}