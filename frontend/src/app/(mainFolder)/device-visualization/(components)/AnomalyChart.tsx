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

export function AnomalyChart({ device, deviceName, metric, startDate, endDate }: {
  device: string | undefined;
  deviceName: string | undefined;
  metric: string | undefined;
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
  const [stats, setStats] = useState<{ mean: number; std: number; totalValues: number; anomaliesFound: number } | null>(null);

  useEffect(() => {
    if (!device || !metric || !startDate || !endDate) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/anomaly/${device}?metric=${metric}&startDate=${startDate}&endDate=${endDate}&email=${encodeURIComponent(user?.email || "")}`
        );
        const apiData = response.data;
        console.log('Anomaly data:', apiData);
        if (!apiData || !apiData.anomalies) {
          setNoData(true);
          return;
        }
        // Prepare data for both normal values and anomalies
        const allData = apiData.allData || [];
        const normalData = allData.filter((point: any) => 
          !apiData.anomalies.some((anomaly: any) => 
            new Date(anomaly.timestamp).getTime() === new Date(point.timestamp).getTime()
          )
        );
        
        const anomalyXY = apiData.anomalies.map((a: any) => ({ x: new Date(a.timestamp), y: a.value }));
        const normalXY = normalData.map((a: any) => ({ x: new Date(a.timestamp), y: a.value }));
        
        setChartData({
          labels: [],
          datasets: [
            {
              label: "Normal Values",
              data: normalXY,
              borderColor: "rgba(75, 192, 192, 0.8)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              pointRadius: 3,
              showLine: true,
            },
            {
              label: "Anomalies",
              data: anomalyXY,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.8)",
              pointRadius: 8,
              showLine: false,
            },
          ],
        });
        
        // Set statistics for display
        setStats({
          mean: apiData.mean || 0,
          std: apiData.std || 0,
          totalValues: apiData.allData?.length || 0,
          anomaliesFound: apiData.anomalies?.length || 0,
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
    return <div><h2>Anomaly Detection for {deviceName ?? device ?? "Device"}</h2><p className="text-red-500">{error || "No anomaly data available"}</p></div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Anomaly Detection for {deviceName ?? device ?? "Device"}</h2>
      
      {/* Statistics Summary */}
      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Readings:</span>
              <span className="ml-2">{stats.totalValues}</span>
            </div>
            <div>
              <span className="font-medium">Anomalies Found:</span>
              <span className="ml-2 text-red-600">{stats.anomaliesFound}</span>
            </div>
            <div>
              <span className="font-medium">Mean:</span>
              <span className="ml-2">{stats.mean.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">Std Dev:</span>
              <span className="ml-2">{stats.std.toFixed(2)}</span>
            </div>
          </div>
          {stats.totalValues > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Anomaly Rate: {((stats.anomaliesFound / stats.totalValues) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
      
      <div className="chart-container w-full h-[300px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
              x: { type: 'time', time: { unit: 'hour' }, title: { display: true, text: 'Time' } },
              y: { beginAtZero: false, min: 0, max: 100, title: { display: true, text: metric ? metric.charAt(0).toUpperCase() + metric.slice(1) : '' } },
            },
          }}
        />
      </div>
    </div>
  );
} 