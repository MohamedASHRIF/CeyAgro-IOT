"use client";
import { useState, useEffect } from "react";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


export function RealTimeChart({
  device,
  metric,
  currentTime,
}: {
  device: string | null;
  metric: "temperature" | "humidity";
  currentTime: Date;
}) {
  const { user } = useUser();
  // State for chart data (labels and dataset for the line chart)
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: `Real-Time ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
        data: [] as number[],
        borderColor:
          metric === "temperature" ? "rgb(255, 99, 132)" : "rgb(75, 192, 192)",
        backgroundColor:
          metric === "temperature"
            ? "rgba(255, 99, 132, 0.2)"
            : "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: false,
      },
    ],
  });
  // State for error messages and no-data conditions
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);
  // Tracks the last timestamp to avoid duplicate updates
  // Relevant: Ensures new data is only added if timestamp changes
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState<number | null>(null);

  // Fetches the latest data from the API
  const fetchLatestData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/realtime/${device}?metric=${metric}&email=${encodeURIComponent(user?.email || "")}`
      );
      const data = response.data;
      console.log("RealTimeChart API response:", data);

      // Validate response format
      if (!data || typeof data !== "object") {
        setError(`Invalid data format: ${JSON.stringify(data)}`);
        setNoData(true);
        return;
      }

      // Extract timestamp and value, defaulting if missing
      const timestamp = data.timestamp || new Date().toISOString();
      const value = data.value ?? 0;
      setLastValue(value);

      // Treat value: 0 as no data, which may hide valid zero values
      if (value === 0 && data.timestamp) {
        setNoData(true);
        return;
      }

      // Update state with new data
      setLastTimestamp(timestamp);
      setChartData({
        labels: [new Date(timestamp).toLocaleTimeString()],
        datasets: [
          {
            label: `Real-Time ${
              metric.charAt(0).toUpperCase() + metric.slice(1)
            }`,
            data: [value],
            borderColor:
              metric === "temperature"
                ? "rgb(255, 99, 132)"
                : "rgb(75, 192, 192)",
            backgroundColor:
              metric === "temperature"
                ? "rgba(255, 99, 132, 0.2)"
                : "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
            fill: false,
          },
        ],
      });
      setError(null);
      setNoData(false);
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      setError("Failed to fetch real-time data");
      setNoData(true);
    }
  };

  
  useEffect(() => {
    console.log("RealTimeChart props:", { device, metric });

    // Validate props to prevent invalid API calls
    if (!device || !metric) {
      setError("Invalid device or metric");
      return;
    }

    // Fetch initial data
    fetchLatestData();

    // Set up polling interval (every 5 seconds)
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/realtime/${device}?metric=${metric}&email=${encodeURIComponent(user?.email || "")}`
        );
        const data = response.data;
        console.log("RealTimeChart polling response:", data);

        // Skip invalid responses
        if (!data || typeof data !== "object") {
          return;
        }

        // Extract timestamp and value
        const timestamp = data.timestamp || new Date().toISOString();
        const value = data.value ?? 0;
        setLastValue(value);

        // Skip zero values with timestamp
        if (value === 0 && data.timestamp) {
          return;
        }

        // Update chart only if timestamp is new
        if (timestamp !== lastTimestamp) {
          setLastTimestamp(timestamp);
          setChartData((prev) => {
            const newLabels = [
              ...prev.labels,
              new Date(timestamp).toLocaleTimeString(),
            ].slice(-20); // Keep last 20 points
            const newData = [...prev.datasets[0].data, value].slice(-20);
            return {
              labels: newLabels,
              datasets: [
                {
                  ...prev.datasets[0],
                  data: newData,
                  label: `Real-Time ${
                    metric.charAt(0).toUpperCase() + metric.slice(1)
                  }`,
                },
              ],
            };
          });
        }
      } catch (error) {
        console.error("Error polling real-time data:", error);
      }
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [device, metric, user]);

  // Add a timer to update the chart with currentTime, even if no new data
  useEffect(() => {
    if (lastValue !== null && currentTime) {
      setChartData((prev) => {
        const currentLabel = currentTime.toLocaleTimeString();
        const lastLabel = prev.labels[prev.labels.length - 1];
        if (lastLabel !== currentLabel) {
          return {
            labels: [...prev.labels, currentLabel].slice(-20),
            datasets: [
              {
                ...prev.datasets[0],
                data: [...prev.datasets[0].data, lastValue].slice(-20),
              },
            ],
          };
        }
        return prev;
      });
    }
  }, [currentTime, lastValue]);

  // Render error or no-data message if applicable
  if (error || noData) {
    return (
      <div>
        <h2>
          Real-Time {metric.charAt(0).toUpperCase() + metric.slice(1)} for{" "}
          {device || "Device"}
        </h2>
        <p className="text-red-500">
          {error || "No data available for this device and metric"}
        </p>
      </div>
    );
  }

  // Calculate chart bounds for y-axis
  const minValue = Math.min(...chartData.datasets[0].data, 0);
  const maxValue = Math.max(...chartData.datasets[0].data, 0);

  // Render the line chart using Chart.js
  return (
    <div className="chart-container w-full h-[300px]">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: "Time" },
            },
            y: {
              title: {
                display: true,
                text: metric.charAt(0).toUpperCase() + metric.slice(1),
              },
              min: minValue - (maxValue - minValue) * 0.1 || 0,
              max: maxValue + (maxValue - minValue) * 0.1 || 100,
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