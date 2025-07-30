"use client";
import { useState, useEffect, useLayoutEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

// Register Chart.js components for rendering bar charts
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


export function DynamicChart({
  device,
  deviceName,
  metric,
  timeRange,
}: {
  device: string | null;
  deviceName: string | null;
  metric: string;
  timeRange: "lastHour" | "lastDay" | "lastWeek";
}) {
  const { user } = useUser();
  
  // Define colors for min, max, avg (avoiding red)
  const colors = {
    min: {
      backgroundColor: "rgba(54, 162, 235, 0.8)", // Blue
      borderColor: "rgba(54, 162, 235, 1)",
    },
    max: {
      backgroundColor: "rgba(75, 192, 192, 0.8)", // Green
      borderColor: "rgba(75, 192, 192, 1)",
    },
    avg: {
      backgroundColor: "rgba(255, 159, 64, 0.8)", // Orange
      borderColor: "rgba(255, 159, 64, 1)",
    },
  };

  // State for chart data (labels and dataset for the bar chart, showing min, max, avg)
  const [chartData, setChartData] = useState({
    labels: ["Min", "Max", "Avg"],
    datasets: [
      {
        label: `Statistics for ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
        data: [] as number[],
        backgroundColor: [colors.min.backgroundColor, colors.max.backgroundColor, colors.avg.backgroundColor],
        borderColor: [colors.min.borderColor, colors.max.borderColor, colors.avg.borderColor],
        borderWidth: 2,
      },
    ],
  });
  // State for error messages and no-data conditions
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

 
  useEffect(() => {
    console.log("DynamicChart props:", { device, metric, timeRange });

    // Validate props to prevent invalid API calls
    if (!device || !metric || !timeRange) {
      setError("Invalid device, metric, or time range");
      return;
    }

   
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/stats/${device}?metric=${metric}&timeRange=${timeRange}&email=${encodeURIComponent(user?.email || "")}`
        );
        const data = response.data;
        console.log("DynamicChart API response:", data);

        // Validate response; treat all-zero stats as no data
        if (!data || typeof data !== "object" || (data.min === 0 && data.max === 0 && data.avg === 0)) {
          setNoData(true);
          setChartData({
            labels: ["Min", "Max", "Avg"],
            datasets: [
              {
                ...chartData.datasets[0],
                data: [0, 0, 0],
                backgroundColor: [colors.min.backgroundColor, colors.max.backgroundColor, colors.avg.backgroundColor],
                borderColor: [colors.min.borderColor, colors.max.borderColor, colors.avg.borderColor],
              },
            ],
          });
          return;
        }

        // Update chart with fetched stats (min, max, avg)
        setChartData({
          labels: ["Min", "Max", "Avg"],
          datasets: [
            {
              ...chartData.datasets[0],
              data: [data.min ?? 0, data.max ?? 0, data.avg ?? 0],
              label: `Statistics for ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
              backgroundColor: [colors.min.backgroundColor, colors.max.backgroundColor, colors.avg.backgroundColor],
              borderColor: [colors.min.borderColor, colors.max.borderColor, colors.avg.borderColor],
            },
          ],
        });
        setError(null);
        setNoData(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to fetch stats");
        setNoData(true);
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
        <h2>Statistics for {metric.charAt(0).toUpperCase() + metric.slice(1)} ({timeRange}) - {deviceName || device || "Device"}</h2>
        <p className="text-red-500">{error || "No data available for this device and metric"}</p>
      </div>
    );
  }

  // Calculate chart bounds for y-axis
  const minValue = Math.min(...chartData.datasets[0].data, 0);
  const maxValue = Math.max(...chartData.datasets[0].data, 0);

  // Render the bar chart using Chart.js
  // Log final chartData before rendering
  console.log('Final chartData (DynamicChart):', chartData);
  return (
    <div className="chart-container w-full h-[300px] min-h-[300px]" style={{ minHeight: 300 }}>
      <Bar
        key={JSON.stringify(chartData)}
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
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