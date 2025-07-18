import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler, CategoryScale);

interface ForecastAreaChartProps {
  device: string;
  metric: 'temperature' | 'humidity';
  email: string;
  futureWindow?: number; // in hours
}

const ForecastAreaChart: React.FC<ForecastAreaChartProps> = ({ device, metric, email, futureWindow = 24 }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!device || !metric || !email) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/forecast/${device}`, {
        params: { metric, futureWindow, email },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch forecast data');
        setLoading(false);
      });
  }, [device, metric, email, futureWindow]);

  if (loading) return <div>Loading forecast...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data || !data.forecast) return <div>No forecast data available.</div>;

  const labels = data.forecast.map((row: any) => {
    const date = new Date(row.timestamp);
    return `${date.getHours()}:00`;
  });
  const values = data.forecast.map((row: any) => row.forecastValue);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Forecasted ${metric.charAt(0).toUpperCase() + metric.slice(1)}`,
        data: values,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(54, 162, 235, 0.4)');
          gradient.addColorStop(1, 'rgba(54, 162, 235, 0.05)');
          return gradient;
        },
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Hour' },
      },
      y: {
        title: { display: true, text: metric.charAt(0).toUpperCase() + metric.slice(1) },
        beginAtZero: false,
      },
    },
  };

  return (
    <div style={{ height: 350 }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastAreaChart; 