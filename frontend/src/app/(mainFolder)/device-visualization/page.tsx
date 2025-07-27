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
import { BarChart3, Activity, Clock, Database } from "lucide-react";

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
          setError("Add your devices to the system to Explore ");
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

  // Update metricLimits when selectedMetric changes
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
    setSelectedDevice(val);
    const device = devices.find(d => d.deviceId === val);
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
        <div className="text-gray-600 text-lg text-center max-w-md p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Devices Available</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Device Visualization Dashboard</h1>
      
      {/* Enhanced Selection Bar */}
      <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-end">
            {/* Device Dropdown */}
            <div className="flex-1 min-w-[250px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Database className="w-4 h-4 text-blue-600" />
                Device Selection
              </label>
              <Select
                value={selectedDevice || ""}
                onValueChange={handleDeviceChange}
              >
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:border-blue-300 focus:border-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Choose a device..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  {devices.map((device) => (
                    <SelectItem
                      key={device.deviceId}
                      value={device.deviceId}
                      className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {device.deviceName || device.deviceId}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metric Dropdown */}
            <div className="flex-1 min-w-[250px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Activity className="w-4 h-4 text-green-600" />
                Metric Type
              </label>
              <Select
                value={selectedMetric || ""}
                onValueChange={handleMetricChange}
              >
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:border-green-300 focus:border-green-500 transition-all duration-200">
                  <SelectValue placeholder="Select metric..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  {metrics.map((metric) => (
                    <SelectItem
                      key={metric}
                      value={metric.toLowerCase()}
                      className="p-3 hover:bg-green-50 cursor-pointer rounded-lg m-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Dropdown */}
            <div className="flex-1 min-w-[250px]">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-purple-600" />
                Time Range
              </label>
              <Select
                value={timeRange}
                onValueChange={handleTimeRangeChange}
              >
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:border-purple-300 focus:border-purple-500 transition-all duration-200">
                  <SelectValue placeholder="Choose time range..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="lastHour" className="p-3 hover:bg-purple-50 cursor-pointer rounded-lg m-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Last Hour
                    </div>
                  </SelectItem>
                  <SelectItem value="lastDay" className="p-3 hover:bg-purple-50 cursor-pointer rounded-lg m-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Last Day
                    </div>
                  </SelectItem>
                  <SelectItem value="lastWeek" className="p-3 hover:bg-purple-50 cursor-pointer rounded-lg m-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Last Week
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDevice && selectedMetric ? (
        <div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <Card className="w-full md:w-1/3 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Real-Time</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <RealTimeGaugeChart
                  device={selectedDevice}
                  metric={selectedMetric ?? undefined}
                  min={metricLimits?.min}
                  max={metricLimits?.max}
                />
              </CardContent>
            </Card>

            <Card className="w-full md:w-1/3 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DynamicChart
                  device={selectedDevice}
                  deviceName={selectedDeviceName}
                  metric={selectedMetric ?? undefined}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>

            <Card className="w-full md:w-1/3 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Device Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {comparisonMetric ? (
                  <ComparisonChart
                    deviceA={selectedDevice}
                    deviceAName={selectedDeviceName ?? ""}
                    deviceB={selectedDevice}
                    deviceBName={selectedDeviceName ?? ""}
                    metric={selectedMetric ?? undefined}
                    startDateA={startDateUTC}
                    endDateA={endDateUTC}
                    startDateB={startDateUTC}
                    endDateB={endDateUTC}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-8">Please select a comparison metric</div>
                )}
              </CardContent>
            </Card>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Forecast Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ForecastAreaChart
                  device={selectedDevice}
                  metric={selectedMetric ?? undefined}
                  email={user?.email ?? ""}
                  min={metricLimits?.min}
                  max={metricLimits?.max}
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gray-100 p-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <AnomalyChart
                  device={selectedDevice}
                  deviceName={selectedDeviceName ?? undefined}
                  metric={selectedMetric ?? undefined}
                  startDate={startDateUTC}
                  endDate={endDateUTC}
                />
              </CardContent>
            </Card>
          </div>

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