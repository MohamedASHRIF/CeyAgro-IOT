"use client";
import { useState, useEffect } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ComparisonChart({ deviceA, deviceAName, deviceB, deviceBName, metric, startDateA, endDateA, startDateB, endDateB }: {
  deviceA: string;
  deviceAName: string;
  deviceB: string;
  deviceBName: string;
  metric: string;
  startDateA: string;
  endDateA: string;
  startDateB: string;
  endDateB: string;
}) {
  const { user } = useUser();
  const [chartData, setChartData] = useState({
    labels: ["Min", "Max", "Avg"],
    datasets: [
      {
        label: `Device A (${deviceAName || deviceA})`,
        data: [0, 0, 0],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: `Device B (${deviceBName || deviceB})`,
        data: [0, 0, 0],
        backgroundColor: "rgba(255, 206, 86, 0.5)",
      },
    ],
  });
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

  useEffect(() => {
    if (!deviceA || !deviceB || !metric || !startDateA || !endDateA || !startDateB || !endDateB) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/compare?deviceA=${deviceA}&deviceB=${deviceB}&metric=${metric}&startDateA=${startDateA}&endDateA=${endDateA}&startDateB=${startDateB}&endDateB=${endDateB}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiData = response.data;
        if (!apiData || !apiData.deviceA || !apiData.deviceB) {
          setNoData(true);
          return;
        }
        setChartData({
          labels: ["Min", "Max", "Avg"],
          datasets: [
            {
              ...chartData.datasets[0],
              data: [apiData.deviceA.min, apiData.deviceA.max, apiData.deviceA.avg],
            },
            {
              ...chartData.datasets[1],
              data: [apiData.deviceB.min, apiData.deviceB.max, apiData.deviceB.avg],
            },
          ],
        });
        setError(null);
        setNoData(false);
      } catch (err) {
        setError("Failed to fetch comparison data");
        setNoData(true);
      }
    };
    fetchData();
  }, [deviceA, deviceB, metric, startDateA, endDateA, startDateB, endDateB, user]);

  if (error || noData) {
    return <div><h2>Device Comparison</h2><p className="text-red-500">{error || "No comparison data available"}</p></div>;
  }

  return (
    <div className="chart-container w-full h-[300px]">
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
    </div>
  );
} 