"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RealTimeChart } from "./(components)/RealTimeChart";
import { HistoryChart } from "./(components)/HistoryChart";
import { DynamicChart } from "./(components)/DynamicChart";
import axios from "axios";


export default function VisualizationPage() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [metrics] = useState<string[]>(["temperature", "humidity"]);
  const [selectedMetric, setSelectedMetric] = useState<"temperature" | "humidity" | null>(null);
  const [timeRange, setTimeRange] = useState<"lastHour" | "lastDay">("lastHour");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  
  useEffect(() => {
    axios
      .get(`${API_BASE}/analytics/names`)
      .then((response) => {
        if (!Array.isArray(response.data) || response.data.length === 0) {
          setError("No devices found");
          setIsLoading(false);
          return;
        }
        setDevices(response.data);
        // Auto-select first device and default metric
        setSelectedDevice(response.data[0]);
        setSelectedMetric("temperature");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setError("Failed to fetch devices");
        setIsLoading(false);
      });
  }, []);

  // Handler for metric selection changes
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value as "temperature" | "humidity");
  };

  // Handler for time range selection changes
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "lastHour" | "lastDay");
  };

  // Render loading state
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

  // Render error state
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

  // Render main visualization page
  return (
    <div className="p-6">
      <style jsx>{`
        .visualization-chart-container {
          position: relative;
          width: 100%;
          height: 300px;
        }
      `}</style>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Device Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            {/* Device selection dropdown */}
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
            {/* Metric selection dropdown */}
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
            {/* Time range selection dropdown */}
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
        </CardContent>
      </Card>

      {/* Render charts only if device and metric are selected */}
      {selectedDevice && selectedMetric ? (
        <>
        
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Real-Time {selectedMetric} for {selectedDevice}</CardTitle>
            </CardHeader>
            <CardContent>
              <RealTimeChart
                key={`realtime-${selectedDevice}-${selectedMetric}`}
                device={selectedDevice}
                metric={selectedMetric}
              />
            </CardContent>
          </Card>

          {/* HistoryChart: Displays historical data */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Historical {selectedMetric} for {selectedDevice}</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryChart
                key={`history-${selectedDevice}-${selectedMetric}-${timeRange}`}
                device={selectedDevice}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>

          {/* DynamicChart: Displays statistical data (min, max, avg) */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics for {selectedMetric} ({timeRange})</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicChart
                key={`dynamic-${selectedDevice}-${selectedMetric}-${timeRange}`}
                device={selectedDevice}
                metric={selectedMetric}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </>
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