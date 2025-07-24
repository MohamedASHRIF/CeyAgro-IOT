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

export function CorrelationChart({ device, deviceName, startDate, endDate, xType, yType }: {
  device: string | undefined;
  deviceName: string | undefined;
  startDate: string;
  endDate: string;
  xType: string | undefined;
  yType: string | undefined;
}) {
  const { user } = useUser();
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false);

  useEffect(() => {
    if (!device || !startDate || !endDate || !xType || !yType) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/correlation/${device}?startDate=${startDate}&endDate=${endDate}&xType=${xType}&yType=${yType}&email=${encodeURIComponent(user?.email || "")}`
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
  }, [device, startDate, endDate, xType, yType, user]);

  if (error || noData) {
    return <div><h2>Correlation for {deviceName ?? device ?? "Device"}</h2><p className="text-red-500">{error || "No correlation data available"}</p></div>;
  }

  return (
    <div className="chart-container w-full h-[300px]">
      <h2 className="mb-2">Correlation ({xType} vs. {yType}): {correlation !== null ? correlation.toFixed(2) : "N/A"}</h2>
      {scatterData.length > 0 ? (
        <Scatter
          data={{
            datasets: [
              {
                label: `${xType} vs. ${yType}`,
                data: scatterData.map((pt: any) => ({ x: pt.x, y: pt.y })),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { display: true, text: xType } },
              y: { title: { display: true, text: yType } },
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