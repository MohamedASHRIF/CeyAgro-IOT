"use client";
import { useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export function CorrelationChart({ device, startDate, endDate }: {
  device: string | null;
  startDate: string;
  endDate: string;
}) {
  const { user } = useUser();
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

  useEffect(() => {
    if (!device || !startDate || !endDate) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/correlation/${device}?startDate=${startDate}&endDate=${endDate}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiData = response.data;
        if (!apiData || typeof apiData.correlation !== "number") {
          setNoData(true);
          return;
        }
        setCorrelation(apiData.correlation);
        if (Array.isArray(apiData.points)) {
          setScatterData(apiData.points);
        } else {
          setScatterData([]);
        }
        setError(null);
        setNoData(false);
      } catch (err) {
        setError("Failed to fetch correlation data");
        setNoData(true);
      }
    };
    fetchData();
  }, [device, startDate, endDate, user]);

  if (error || noData) {
    return <div><h2>Correlation</h2><p className="text-red-500">{error || "No correlation data available"}</p></div>;
  }

  return (
    <div className="chart-container w-full h-[300px]">
      <h2 className="mb-2">Correlation (Temp vs. Humidity): {correlation !== null ? correlation.toFixed(2) : "N/A"}</h2>
      {scatterData.length > 0 ? (
        <Scatter
          data={{
            datasets: [
              {
                label: "Temp vs. Humidity",
                data: scatterData.map((pt: any) => ({ x: pt.x, y: pt.y })),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { display: true, text: "Temperature" } },
              y: { title: { display: true, text: "Humidity" } },
            },
            plugins: { legend: { display: true } },
          }}
        />
      ) : (
        <div className="text-gray-400 text-center">No scatter data available</div>
      )}
    </div>
  );
} 