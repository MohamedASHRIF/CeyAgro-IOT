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
    if (!device || !startDate || !endDate || !xType || !yType) {
      console.log('DEBUG: CorrelationChart missing required props:', { device, startDate, endDate, xType, yType });
      return;
    }
    
    console.log('DEBUG: CorrelationChart fetching data with:', { device, startDate, endDate, xType, yType });
    
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/correlation/${device}?startDate=${startDate}&endDate=${endDate}&xType=${xType}&yType=${yType}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiData = response.data;
        console.log('DEBUG: CorrelationChart API response:', apiData);
        
        // Check if we have points data, correlation can be null but still have points
        if (!apiData || !Array.isArray(apiData.points)) {
          console.log('DEBUG: CorrelationChart no points data available');
          setNoData(true);
          return;
        }
        
        setCorrelation(apiData.correlation);
        setScatterData(apiData.points);
        setError(null);
        setNoData(false);
        console.log('DEBUG: CorrelationChart set data:', { correlation: apiData.correlation, pointsCount: apiData.points.length });
      } catch (err) {
        console.error('DEBUG: CorrelationChart error:', err);
        setError("Failed to fetch correlation data");
        setNoData(true);
      }
    };
    fetchData();
  }, [device, startDate, endDate, xType, yType, user]);

  if (error || noData) {
    return (
      <div>
        <h2>Correlation for {deviceName ?? device ?? "Device"}</h2>
        <p className="text-red-500">{error || "No correlation data available"}</p>
        <p className="text-sm text-gray-500">Debug: {xType} vs {yType}</p>
      </div>
    );
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
        <div className="text-gray-400 text-center">
          No scatter data available
          <br />
          <span className="text-xs">Points found: {scatterData.length}</span>
        </div>
      )}
    </div>
  );
} 