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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function AnomalyChart({ device, metric, startDate, endDate }: {
  device: string | null;
  metric: "temperature" | "humidity";
  startDate: string;
  endDate: string;
}) {
  const { user } = useUser();
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Normal Values",
        data: [] as number[],
        borderColor: "rgba(75,192,192,0.4)",
        backgroundColor: "rgba(75,192,192,0.1)",
        pointRadius: 2,
        showLine: true,
      },
      {
        label: "Anomalies",
        data: [] as number[],
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        pointRadius: 6,
        showLine: false,
      },
    ],
  });
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

  useEffect(() => {
    if (!device || !metric || !startDate || !endDate) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/anomaly/${device}?metric=${metric}&startDate=${startDate}&endDate=${endDate}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiData = response.data;
        if (!apiData || !apiData.anomalies) {
          setNoData(true);
          return;
        }
        // All points (normal + anomalies)
        const allPoints = apiData.allPoints || apiData.anomalies.concat([]); // fallback if backend doesn't provide allPoints
        // If backend doesn't provide allPoints, use anomalies only
        const allTimestamps = allPoints.map((a: any) => a.timestamp);
        setChartData({
          labels: allPoints.map((a: any) => a.timestamp ? new Date(a.timestamp).toLocaleString() : "Unknown"),
          datasets: [
            {
              label: "All Values",
              data: allPoints.map((a: any) => a.value),
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.1)",
              pointRadius: 2,
              showLine: true,
              fill: false,
            },
            {
              label: "Anomalies",
              data: allPoints.map((a: any) => {
                const isAnomaly = apiData.anomalies.some((an: any) => an.timestamp === a.timestamp && an.value === a.value);
                return isAnomaly ? a.value : null;
              }),
              borderColor: "rgba(255,99,132,1)",
              backgroundColor: "rgba(255,99,132,0.2)",
              pointRadius: 6,
              showLine: false,
              fill: false,
            },
          ],
        });
        setError(null);
        setNoData(false);
      } catch (err) {
        setError("Failed to fetch anomaly data");
        setNoData(true);
      }
    };
    fetchData();
  }, [device, metric, startDate, endDate, user]);

  if (error || noData) {
    return <div><h2>Anomaly Detection</h2><p className="text-red-500">{error || "No anomaly data available"}</p></div>;
  }

  return (
    <div className="chart-container w-full h-[300px]">
      <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
    </div>
  );
} 