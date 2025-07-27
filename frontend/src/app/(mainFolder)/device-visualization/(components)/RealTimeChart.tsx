"use client";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from "chart.js";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { formatColomboDate } from "@/lib/timezone";

ChartJS.register(ArcElement, Tooltip);

export function RealTimeGaugeChart({
  device,
  metric,
  min = 0,
  max = 100,
}: {
  device: string | null;
  metric: string;
  min?: number;
  max?: number;
}) {
  const { user } = useUser();
  const [value, setValue] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!device || !metric || !user?.email) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/realtime/${device}?metric=${metric}&email=${encodeURIComponent(user.email)}`
      );
      const data = res.data;
      if (data?.value !== undefined) {
        setValue(data.value);
        setLastUpdated(formatColomboDate(data.timestamp ?? new Date().toISOString(), "HH:mm:ss"));
        setError(null);
      } else {
        setError("No data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching data");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [device, metric, user]);

  const clampedValue = Math.max(min, Math.min(max, value));
  const percent = ((clampedValue - min) / (max - min)) * 100;

  const outOfRange = value < min || value > max;
  const fillColor = outOfRange ? "#EF4444" : "#3B82F6"; // red or blue
  const backgroundColor = "#E5E7EB"; // light gray

  const chartData = {
    datasets: [
      {
        data: [percent, 100 - percent],
        backgroundColor: [fillColor, backgroundColor],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: "75%",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full max-w-xs mx-auto text-center p-2">
      {error ? (
        <p style={{ color: "#EF4444", fontSize: "0.875rem" }}>{error}</p>
      ) : (
        <>
          <div className="relative h-[140px] w-full">
            <Doughnut data={chartData} options={chartOptions} />
            {/* Min Label */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: "-25px",
                fontSize: "0.875rem",
                fontWeight: "bold",
                color: "#EF4444",
              }}
            >
              {min}
            </div>
            {/* Max Label */}
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: "-25px",
                fontSize: "0.875rem",
                fontWeight: "bold",
                color: "#EF4444",
              }}
            >
              {max}
            </div>
            {/* Value */}
            <div
              style={{
                position: "absolute",
                top: "65%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1F2937",
              }}
            >
              {value.toFixed(1)}
            </div>
            {/* Last Updated */}
            {lastUpdated && (
              <div
                style={{
                  position: "absolute",
                  top: "75%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.75rem",
                  color: "#6B7280",
                }}
              >
                Last updated at {lastUpdated}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}