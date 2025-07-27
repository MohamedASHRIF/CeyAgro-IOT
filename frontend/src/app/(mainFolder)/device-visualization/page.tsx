"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RealTimeGaugeChart } from "./(components)/RealTimeChart";
import { HistoryChart } from "./(components)/HistoryChart";
import { DynamicChart } from "./(components)/DynamicChart";
import { AnomalyChart } from "./(components)/AnomalyChart";
import { ComparisonChart } from "./(components)/ComparisonChart";
import { CorrelationChart } from "./(components)/CorrelationChart";
import ForecastAreaChart from "./(components)/ForecastAreaChart";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function VisualizationPage() {
  const { user, isLoading } = useUser();
  const [devices, setDevices] = useState<{ deviceId: string; deviceName: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<string | null>(null);
  const [correlationMetric2, setCorrelationMetric2] = useState<string | null>(null);
  const [anomalyMetric, setAnomalyMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"lastHour" | "lastDay" | "lastWeek">("lastHour");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metricLimits, setMetricLimits] = useState<{ min: number; max: number } | null>(null);
  const [allMetricInfo, setAllMetricInfo] = useState<any[]>([]);

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
        const firstDevice = response.data.data[0];
        setSelectedDevice(firstDevice.deviceId);
        setSelectedDeviceName(firstDevice.deviceName);
        setIsLoadingDevices(false);
      })
      .catch(() => {
        setError("Failed to fetch devices");
        setIsLoadingDevices(false);
      });
  }, [user]);

  useEffect(() => {
    if (!selectedDevice || !user?.email) {
      setMetrics([]);
      setSelectedMetric(null);
      setComparisonMetric(null);
      setCorrelationMetric2(null);
      setAnomalyMetric(null);
      setMetricLimits(null);
      setAllMetricInfo([]);
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
          
          // Set default metrics for all charts
          setSelectedMetric(types[0]?.toLowerCase() || null);
          setComparisonMetric(types[1]?.toLowerCase() || null);
          setCorrelationMetric2(types[1]?.toLowerCase() || null);
          setAnomalyMetric(types[0]?.toLowerCase() || null);
          
          // Set metricLimits for the first metric by default
          const found = response.data.data.find((t: any) => t.type.toLowerCase() === types[0]?.toLowerCase());
          setMetricLimits(found ? { min: found.minValue, max: found.maxValue } : null);
          // Store all metric info for later lookup
          setAllMetricInfo(response.data.data);
        } else {
          setMetrics([]);
          setSelectedMetric(null);
          setComparisonMetric(null);
          setCorrelationMetric2(null);
          setAnomalyMetric(null);
          setMetricLimits(null);
          setAllMetricInfo([]);
        }
      })
      .catch(() => {
        setMetrics([]);
        setSelectedMetric(null);
        setComparisonMetric(null);
        setCorrelationMetric2(null);
        setAnomalyMetric(null);
        setMetricLimits(null);
        setAllMetricInfo([]);
      });
  }, [selectedDevice, user]);

  // Update metric limits when selected metric changes
  useEffect(() => {
    if (selectedMetric && allMetricInfo.length > 0) {
      const found = allMetricInfo.find((t: any) => t.type.toLowerCase() === selectedMetric);
      setMetricLimits(found ? { min: found.minValue, max: found.maxValue } : null);
    }
  }, [selectedMetric, allMetricInfo]);

  // Calculate date ranges based on timeRange (using Sri Lankan time)
  const now = new Date();
  let startDateUTC: string;
  let endDateUTC: string;

  // Convert current time to Sri Lankan time for consistent date calculations
  const nowColombo = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // UTC+5:30

  if (timeRange === "lastHour") {
    startDateUTC = new Date(nowColombo.getTime() - 60 * 60 * 1000).toISOString();
    endDateUTC = nowColombo.toISOString();
  } else if (timeRange === "lastDay") {
    startDateUTC = new Date(nowColombo.getTime() - 24 * 60 * 60 * 1000).toISOString();
    endDateUTC = nowColombo.toISOString();
  } else {
    startDateUTC = new Date(nowColombo.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    endDateUTC = nowColombo.toISOString();
  }

  const handleDeviceChange = (val: string) => {
    const device = devices.find(d => d.deviceId === val);
    setSelectedDevice(val);
    setSelectedDeviceName(device?.deviceName || null);
  };

  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "lastHour" | "lastDay" | "lastWeek");
  };

  if (isLoading || isLoadingDevices) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Device Visualization Dashboard</h1>
      
      {/* Selection Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Device Dropdown */}
          <div style={{ width: "220px" }}>
            <label className="block text-sm font-bold text-gray-800 mb-1 bg-gray-100 p-1 rounded">Device</label>
            <Select
              value={selectedDevice || ""}
              onValueChange={handleDeviceChange}
            >
              <SelectTrigger className="w-full border border-gray-300 rounded p-2 bg-white">
                <SelectValue placeholder="Select Device" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {devices.map((device) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {device.deviceName || device.deviceId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Metric Dropdown */}
          <div style={{ width: "220px" }}>
            <label className="block text-sm font-bold text-gray-800 mb-1 bg-gray-100 p-1 rounded">Metric</label>
            <Select
              value={selectedMetric || ""}
              onValueChange={handleMetricChange}
            >
              <SelectTrigger className="w-full border border-gray-300 rounded p-2 bg-white">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {metrics.map((metric) => (
                  <SelectItem
                    key={metric}
                    value={metric.toLowerCase()}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Time Range Dropdown */}
          <div style={{ width: "220px" }}>
            <label className="block text-sm font-bold text-gray-800 mb-1 bg-gray-100 p-1 rounded">Time Range</label>
            <Select
              value={timeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-full border border-gray-300 rounded p-2 bg-white">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="lastHour" className="p-2 hover:bg-gray-100 cursor-pointer">Last Hour</SelectItem>
                <SelectItem value="lastDay" className="p-2 hover:bg-gray-100 cursor-pointer">Last Day</SelectItem>
                <SelectItem value="lastWeek" className="p-2 hover:bg-gray-100 cursor-pointer">Last Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedDevice && selectedMetric ? (
        <div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <Card className="w-full md:w-1/3 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Real-Time</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <RealTimeGaugeChart device={selectedDevice} metric={selectedMetric} min={metricLimits?.min} max={metricLimits?.max} />
              </CardContent>
            </Card>
            <Card className="w-full md:w-2/3 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Trend ({timeRange === "lastHour" ? "Last Hour" : timeRange === "lastDay" ? "Last Day" : "Last Week"})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[400px]">
                <HistoryChart
                  key={timeRange + '-' + (selectedDevice ?? '') + '-' + (selectedMetric ?? '')}
                  device={selectedDevice}
                  deviceName={selectedDeviceName}
                  metric={selectedMetric ?? undefined}
                  timeRange={timeRange as "lastHour" | "lastDay" | "lastWeek"}
                  min={metricLimits?.min}
                  max={metricLimits?.max}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Statistics (Min/Max/Avg)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DynamicChart device={selectedDevice} deviceName={selectedDeviceName} metric={selectedMetric ?? undefined} timeRange={timeRange as "lastHour" | "lastDay" | "lastWeek"} />
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Device Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {devices.length >= 2 ? (
                  <ComparisonChart deviceA={devices[0]?.deviceId ?? undefined} deviceAName={devices[0]?.deviceName ?? undefined} deviceB={devices[1]?.deviceId ?? undefined} deviceBName={devices[1]?.deviceName ?? undefined} metric={selectedMetric ?? undefined} startDateA={startDateUTC} endDateA={endDateUTC} startDateB={startDateUTC} endDateB={endDateUTC} />
                ) : (
                  <div className="text-gray-400 text-center">Need at least 2 devices</div>
                )}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Analytics</h2>
          
          {/* Correlation Chart with Metric Selection */}
          <Card className="shadow-lg hover:shadow-xl mb-6">
            <CardHeader className="bg-gray-100 p-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <div style={{ width: "200px" }}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Y-Axis Metric</label>
                  <Select
                    value={correlationMetric2 || ""}
                    onValueChange={setCorrelationMetric2}
                  >
                    <SelectTrigger className="w-full border border-gray-300 rounded p-2 bg-white">
                      <SelectValue placeholder="Select Metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {metrics.map((metric) => (
                        <SelectItem
                          key={metric}
                          value={metric.toLowerCase()}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedMetric && correlationMetric2 ? (
                <CorrelationChart 
                  device={selectedDevice ?? undefined} 
                  deviceName={selectedDeviceName ?? undefined} 
                  startDate={startDateUTC} 
                  endDate={endDateUTC} 
                  xType={selectedMetric ?? undefined} 
                  yType={correlationMetric2 ?? undefined} 
                />
              ) : (
                <div className="text-gray-400 text-center py-8">Please select a metric for correlation analysis</div>
              )}
              <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-4 border-blue-500">
                Insight: Correlation between {selectedMetric} and {correlationMetric2} may help in predictive analytics.
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Forecast Chart with Metric Selection */}
            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Forecast Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {selectedMetric && user && user.email ? (
                  <ForecastAreaChart 
                    device={selectedDevice} 
                    metric={selectedMetric} 
                    email={user.email} 
                    futureWindow={24}
                    min={allMetricInfo.find(m => m.type.toLowerCase() === selectedMetric)?.minValue}
                    max={allMetricInfo.find(m => m.type.toLowerCase() === selectedMetric)?.maxValue}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-8">Please select a metric for forecasting</div>
                )}
                <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-4 border-blue-500">
                  Insight: Forecast shows potential trend for next 24 hours for {selectedMetric}.
                </div>
              </CardContent>
            </Card>

            {/* Anomaly Chart with Metric Selection */}
            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {anomalyMetric ? (
                  <AnomalyChart 
                    device={selectedDevice ?? undefined} 
                    deviceName={selectedDeviceName ?? undefined} 
                    metric={anomalyMetric ?? undefined} 
                    startDate={startDateUTC} 
                    endDate={endDateUTC} 
                  />
                ) : (
                  <div className="text-gray-400 text-center py-8">Please select a metric for anomaly detection</div>
                )}
                <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-4 border-red-500">
                  Insight: Any anomaly detected outside expected range will be shown for {anomalyMetric}.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Please select a device and metric to view charts.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}