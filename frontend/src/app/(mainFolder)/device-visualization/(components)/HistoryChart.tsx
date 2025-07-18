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

// Register Chart.js components for rendering line charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function HistoryChart({
  device,
  metric,
  timeRange,
}: {
  device: string | null;
  metric: "temperature" | "humidity";
  timeRange: "lastHour" | "lastDay";
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

    // Calculate date range based on timeRange (last hour or last day)
    const now = new Date();
    const startDate = new Date(
      now.getTime() - (timeRange === "lastHour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
    ).toISOString();
    const endDate = now.toISOString();

    // Fetch historical data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/history/${device}?metric=${metric}&startDate=${startDate}&endDate=${endDate}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiResponse = response.data;
        const points = Array.isArray(apiResponse) ? apiResponse : apiResponse.data;
        console.log("HistoryChart API response:", points);

        // Validate response as an array; empty array indicates no data
        if (!Array.isArray(points) || points.length === 0) {
          setNoData(true);
          setChartData({
            labels: [],
            datasets: [{ ...chartData.datasets[0], data: [] }],
          });
          return;
        }

        // Update chart with fetched data
        setChartData({
          labels: points.map(item =>
            item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown"
          ),
          datasets: [
            {
              ...chartData.datasets[0],
              data: points.map(item => item.value ?? 0),
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
        <h2>Historical {metric.charAt(0).toUpperCase() + metric.slice(1)} for {device || "Device"}</h2>
        <p className="text-red-500">{error || "No data available for this device and metric"}</p>
      </div>
    );
  }

  // Calculate chart bounds for y-axis
  const minValue = Math.min(...chartData.datasets[0].data, 0);
  const maxValue = Math.max(...chartData.datasets[0].data, 0);

  // Log final chartData before rendering
  console.log('Final chartData (HistoryChart):', chartData);
  // Render the line chart using Chart.js
  return (
    <div className="chart-container w-full h-[300px] min-h-[300px]" style={{ minHeight: 300 }}>
      <Line
        key={JSON.stringify(chartData)}
        data={chartData}
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