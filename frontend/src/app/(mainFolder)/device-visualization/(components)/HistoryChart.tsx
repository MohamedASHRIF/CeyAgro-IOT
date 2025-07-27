"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { formatColomboDate } from "@/lib/timezone";

// Register Chart.js components for rendering line charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function HistoryChart({
  device,
  deviceName,
  metric,
  timeRange,
  min,
  max,
}: {
  device: string | null;
  deviceName: string | null;
  metric: string;
  timeRange: "lastHour" | "lastDay" | "lastWeek";
  min?: number;
  max?: number;
}) {
  const { user } = useUser();
  // State for chart data (labels and dataset for the line chart)
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: `Historical ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
        data: [] as number[],
        borderColor: metric === "temperature" ? "rgb(255, 99, 132)" : "rgb(75, 192, 192)",
        backgroundColor: metric === "temperature" ? "rgba(255, 99, 132, 0.2)" : "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: false,
      },
    ],
  });
  // State for error messages and no-data conditions
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

 
  useEffect(() => {
    console.log("HistoryChart props:", { device, metric, timeRange });

    // Validate props to prevent invalid API calls
    if (!device || !metric || !timeRange) {
      setError("Invalid device, metric, or time range");
      return;
    }

    // Calculate date range and bucket info based on timeRange
    const now = new Date();
    let startDate: Date;
    let interval: number;
    let bucketCount: number;
    if (timeRange === "lastHour") {
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      interval = 5 * 60 * 1000; // 5 minutes
      bucketCount = 12;
    } else if (timeRange === "lastDay") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      interval = 60 * 60 * 1000; // 1 hour
      bucketCount = 24;
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      interval = 24 * 60 * 60 * 1000; // 1 day
      bucketCount = 7;
    }
    const endDate = now;

    // Fetch historical data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/history/${device}?metric=${metric}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiResponse = response.data;
        const points = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse;
        
        console.log('HistoryChart timeRange:', timeRange);
        console.log('HistoryChart API response:', points);

        // Get current time in Sri Lanka for consistent bucketing
        const nowColombo = new Date(formatColomboDate(new Date().toISOString(), "YYYY-MM-DDTHH:mm:ss"));
        
        if (timeRange === "lastHour") {
          // Generate 12 consecutive 5-min intervals ending now (Sri Lanka time)
          const timeLabels: string[] = [];
          const bucketData: number[] = [];
          
          for (let i = 11; i >= 0; i--) {
            const bucketTime = new Date(nowColombo.getTime() - i * 5 * 60 * 1000);
            const label = formatColomboDate(bucketTime.toISOString(), "HH:mm");
            timeLabels.push(label);
            
            // Find points that fall within this 5-minute bucket
            const bucketStart = new Date(bucketTime.getTime());
            const bucketEnd = new Date(bucketTime.getTime() + 5 * 60 * 1000);
            
            const bucketPoints = points.filter((p: any) => {
              const pointTime = new Date(p.timestamp || p.date || p.label);
              return pointTime >= bucketStart && pointTime < bucketEnd;
            });
            
            if (bucketPoints.length > 0) {
              const avg = bucketPoints.reduce((sum: any, item: any) => sum + (item.value ?? 0), 0) / bucketPoints.length;
              bucketData.push(avg);
            } else {
              bucketData.push(0);
            }
          }
          
          setChartData({
            labels: timeLabels,
            datasets: [
              {
                ...chartData.datasets[0],
                data: bucketData,
                label: `Historical ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
              },
            ],
          });
          setError(null);
          setNoData(false);
          return;
        }
        
        if (timeRange === "lastDay") {
          // Generate 24 consecutive hours ending now (Sri Lanka time)
          const hourLabels: string[] = [];
          const bucketData: number[] = [];
          
          for (let i = 23; i >= 0; i--) {
            const bucketTime = new Date(nowColombo.getTime() - i * 60 * 60 * 1000);
            const label = formatColomboDate(bucketTime.toISOString(), "HH:00");
            hourLabels.push(label);
            
            // Find points that fall within this hour bucket
            const bucketStart = new Date(bucketTime.getTime());
            const bucketEnd = new Date(bucketTime.getTime() + 60 * 60 * 1000);
            
            const bucketPoints = points.filter((p: any) => {
              const pointTime = new Date(p.timestamp || p.date || p.label);
              return pointTime >= bucketStart && pointTime < bucketEnd;
            });
            
            if (bucketPoints.length > 0) {
              const avg = bucketPoints.reduce((sum: any, item: any) => sum + (item.value ?? 0), 0) / bucketPoints.length;
              bucketData.push(avg);
            } else {
              bucketData.push(0);
            }
          }
          
          setChartData({
            labels: hourLabels,
            datasets: [
              {
                ...chartData.datasets[0],
                data: bucketData,
                label: `Historical ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
              },
            ],
          });
          setError(null);
          setNoData(false);
          return;
        }
        
        if (timeRange === "lastWeek") {
          // Generate 7 consecutive days ending today (Sri Lanka time)
          const dayLabels: string[] = [];
          const bucketData: number[] = [];
          
          for (let i = 6; i >= 0; i--) {
            const bucketTime = new Date(nowColombo.getTime() - i * 24 * 60 * 60 * 1000);
            const label = formatColomboDate(bucketTime.toISOString(), "YYYY-MM-DD");
            dayLabels.push(label);
            
            // Find points that fall within this day bucket
            const bucketStart = new Date(bucketTime.getTime());
            const bucketEnd = new Date(bucketTime.getTime() + 24 * 60 * 60 * 1000);
            
            const bucketPoints = points.filter((p: any) => {
              const pointTime = new Date(p.timestamp || p.date || p.label);
              return pointTime >= bucketStart && pointTime < bucketEnd;
            });
            
            if (bucketPoints.length > 0) {
              const avg = bucketPoints.reduce((sum: any, item: any) => sum + (item.value ?? 0), 0) / bucketPoints.length;
              bucketData.push(avg);
            } else {
              bucketData.push(0);
            }
          }
          
          setChartData({
            labels: dayLabels,
            datasets: [
              {
                ...chartData.datasets[0],
                data: bucketData,
                label: `Historical ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
              },
            ],
          });
          setError(null);
          setNoData(false);
          return;
        }

        // Fallback for any other case
        setChartData({
          labels: points.map((p: any) => formatColomboDate(p.timestamp || p.date || p.label, "HH:mm")),
          datasets: [
            {
              ...chartData.datasets[0],
              data: points.map((p: any) => p.value),
              label: `Historical ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
            },
          ],
        });
        setError(null);
        setNoData(false);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setError("Failed to fetch historical data");
        setNoData(true);
        setChartData({
          labels: [],
          datasets: [{ ...chartData.datasets[0], data: [] }],
        });
      }
    };

    fetchData();
  }, [device, metric, timeRange, user]);

  useLayoutEffect(() => {
    // Force a re-render when chartData changes
    console.log('useLayoutEffect: chartData updated', chartData);
  }, [chartData]);

  // Render error or no-data message if applicable
  if (error || noData) {
    return (
      <div>
        <h2>Historical {metric.charAt(0).toUpperCase() + metric.slice(1)} for {deviceName || device || "Device"}</h2>
        <p className="text-red-500">{error || "No data available for this device and metric"}</p>
      </div>
    );
  }

  // Calculate chart bounds for y-axis
  const minValue = Math.min(...chartData.datasets[0].data, 0);
  const maxValue = Math.max(...chartData.datasets[0].data, 0);

  // Highlight out-of-range points in red
  const pointColors = chartData.datasets[0].data.map((v) =>
    min !== undefined && max !== undefined && (v < min || v > max)
      ? "red"
      : chartData.datasets[0].borderColor
  );
  // Log final chartData before rendering
  console.log('Final chartData (HistoryChart):', chartData);
  // Render the line chart using Chart.js
  return (
    <div className="chart-container w-full h-[300px] min-h-[300px]" style={{ minHeight: 300 }}>
      <Line
        key={JSON.stringify(chartData)}
        data={{
          ...chartData,
          datasets: [
            {
              ...chartData.datasets[0],
              pointBackgroundColor: pointColors,
              pointBorderColor: pointColors,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: "Time" },
            },
            y: {
              title: { display: true, text: metric.charAt(0).toUpperCase() + metric.slice(1) },
              min: Math.min(...chartData.datasets[0].data, 0) - (Math.max(...chartData.datasets[0].data, 0) - Math.min(...chartData.datasets[0].data, 0)) * 0.1,
              max: Math.max(...chartData.datasets[0].data, 0) + (Math.max(...chartData.datasets[0].data, 0) - Math.min(...chartData.datasets[0].data, 0)) * 0.1,
            },
          },
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
        }}
      />
    </div>
  );
}