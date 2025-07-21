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
// import { PredictionChart } from "./(components)/PredictionChart";
// import { ForecastChart } from "./(components)/ForecastChart";
import ForecastAreaChart from "./(components)/ForecastAreaChart";


export default function VisualizationPage() {
  const { user, isLoading } = useUser();
  const [devices, setDevices] = useState<{ deviceId: string; deviceName: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<string[]>([]); // Now dynamic
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
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
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-device-list`, {
        params: { email: user.email },
      })
      .then((response) => {
        if (!response.data.success || !Array.isArray(response.data.data) || response.data.data.length === 0) {
          setError("No devices found");
          setIsLoadingDevices(false);
          return;
        }
        setDevices(response.data.data);
        // Auto-select first device
        const firstDevice = response.data.data[0];
        setSelectedDevice(firstDevice.deviceId);
        setSelectedDeviceName(firstDevice.deviceName);
        setIsLoadingDevices(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch devices");
        setIsLoadingDevices(false);
      });
  }, [user]);

  // Fetch device types (metrics) when selectedDevice changes
  useEffect(() => {
    if (!selectedDevice || !user?.email) {
      setMetrics([]);
      setSelectedMetric(null);
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/device-types`, {
        params: { deviceId: selectedDevice, email: user.email },
      })
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          const types = response.data.data.map((t: any) => t.type);
          setMetrics(types);
          // Auto-select first metric if available
          setSelectedMetric(types[0] || null);
        } else {
          setMetrics([]);
          setSelectedMetric(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching device types:", error);
        setMetrics([]);
        setSelectedMetric(null);
      });
  }, [selectedDevice, user]);

  // Handler for device selection changes
  const handleDeviceChange = (val: string) => {
    setSelectedDevice(val);
    const found = devices.find((d) => d.deviceId === val);
    setSelectedDeviceName(found ? found.deviceName : null);
  };

  // Handler for metric selection changes
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
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

  // Debug: log device IDs for comparison chart
  if (devices.length >= 2 && devices[0] && devices[1]) {
    console.log('ComparisonChart deviceA:', devices[0].deviceId, 'deviceB:', devices[1].deviceId);
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
        <Select value={selectedDevice || ""} onValueChange={handleDeviceChange} disabled={devices.length === 0}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.deviceName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMetric || ""} onValueChange={handleMetricChange} disabled={metrics.length === 0}>
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
                deviceName={selectedDeviceName}
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
                deviceName={selectedDeviceName}
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
                deviceName={selectedDeviceName}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
          {/* Correlation */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Correlation (Temp vs. Humidity)</CardTitle></CardHeader>
            <CardContent>
              <CorrelationChart
                device={selectedDevice}
                deviceName={selectedDeviceName}
                startDate={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                endDate={new Date().toISOString()}
              />
            </CardContent>
          </Card>
          {/* Forecast (moved here, replacing Prediction) */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Forecast</CardTitle></CardHeader>
            <CardContent>
              {user && user.email && (
                <ForecastAreaChart
                  device={selectedDevice}
                  deviceName={selectedDeviceName}
                  metric={selectedMetric}
                  email={user.email}
                  futureWindow={24}
                />
              )}
            </CardContent>
          </Card>
          {/* Device Comparison */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Device Comparison</CardTitle></CardHeader>
            <CardContent>
              {devices.length >= 2 && devices[0] && devices[1] ? (
                <ComparisonChart
                  deviceA={devices[0].deviceId}
                  deviceAName={devices[0].deviceName}
                  deviceB={devices[1].deviceId}
                  deviceBName={devices[1].deviceName}
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
          {/* Anomaly Detection */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Anomaly Detection</CardTitle></CardHeader>
            <CardContent>
              <AnomalyChart
                device={selectedDevice}
                deviceName={selectedDeviceName}
                metric={selectedMetric}
                startDate={new Date(Date.now() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()}
                endDate={new Date().toISOString()}
              />
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