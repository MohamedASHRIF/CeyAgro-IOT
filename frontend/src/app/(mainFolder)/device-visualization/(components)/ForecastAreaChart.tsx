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
import type { ChartOptions } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler, CategoryScale);

interface ForecastAreaChartProps {
  device: string | undefined;
  metric: string | undefined;
  email: string;
  futureWindow?: number; // in hours
  min?: number;
  max?: number;
}

const windowOptions = [6, 12, 24, 48];

const ForecastAreaChart: React.FC<ForecastAreaChartProps> = ({ device, metric, email, futureWindow = 24, min, max }) => {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowValue, setWindowValue] = useState(futureWindow);

  useEffect(() => {
    if (!device || !metric || !email) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/forecast/${device}`, {
        params: { metric, futureWindow: windowValue, email },
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch forecast data');
        setLoading(false);
      });
  }, [device, metric, email, windowValue]);

  // Fetch historical data for overlay
  useEffect(() => {
    if (!device || !metric || !email) return;
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const endDate = now.toISOString();
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/history/${device}`, {
        params: { metric, startDate, endDate, email },
      })
      .then((res) => {
        setHistory(Array.isArray(res.data) ? res.data : res.data.data);
      })
      .catch(() => setHistory([]));
  }, [device, metric, email]);

  if (loading) return <div>Loading forecast...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data || !data.forecast) return <div>No forecast data available.</div>;

  // Prepare forecast data
  console.log('Forecast data:', data.forecast);
  // Historical overlay
  console.log('Historical data:', history);
  const histPoints = history.map((row: any) => ({ x: new Date(row.timestamp), y: row.value }));
  // Forecast points
  const forecastPoints = data.forecast.map((row: any) => ({ x: new Date(row.timestamp), y: row.forecastValue }));
  // Confidence interval area (as two lines: lower and upper)
  const lowerPoints = data.forecast.map((row: any) => ({ x: new Date(row.timestamp), y: row.lower ?? (row.forecastValue - 2) }));
  const upperPoints = data.forecast.map((row: any) => ({ x: new Date(row.timestamp), y: row.upper ?? (row.forecastValue + 2) }));
  // Out-of-range highlighting for forecast
  const pointColors = forecastPoints.map((pt: any) =>
    min !== undefined && max !== undefined && (pt.y < min || pt.y > max) ? 'red' : 'rgba(54, 162, 235, 1)'
  );

  // Chart.js datasets
  const chartData = {
    datasets: [
      {
        label: 'Historical',
        data: histPoints,
        borderColor: 'rgba(99, 99, 99, 0.7)',
        backgroundColor: 'rgba(99, 99, 99, 0.7)',
        pointRadius: 2,
        tension: 0.2,
        order: 1,
        spanGaps: true,
        fill: false,
      },
      {
        label: `Forecasted ${metric ? metric.charAt(0).toUpperCase() + metric.slice(1) : ''}`,
        data: forecastPoints,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 3,
        tension: 0.3,
        order: 2,
        fill: false,
      },
      // Confidence interval as two lines (shaded area between them)
      {
        label: 'Lower Bound',
        data: lowerPoints,
        borderColor: 'rgba(54, 162, 235, 0.0)',
        backgroundColor: 'rgba(54, 162, 235, 0.15)',
        pointRadius: 0,
        fill: '+1', // fill to next dataset (upper bound)
        order: 0,
        tension: 0.3,
      },
      {
        label: 'Upper Bound',
        data: upperPoints,
        borderColor: 'rgba(54, 162, 235, 0.0)',
        backgroundColor: 'rgba(54, 162, 235, 0.15)',
        pointRadius: 0,
        fill: false,
        order: 0,
        tension: 0.3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'hour', tooltipFormat: 'PPpp' },
        title: { display: true, text: 'Time' },
      },
      y: {
        title: { display: true, text: metric ? metric.charAt(0).toUpperCase() + metric.slice(1) : '' },
        beginAtZero: false,
      },
    },
  };

  // Model quality metric
  const modelQuality = data.rmse || data.r2 || data.modelQuality || 'N/A';

  return (
    <div style={{ height: 350 }}>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="forecast-window">Forecast Window:</label>
        <select
          id="forecast-window"
          value={windowValue}
          onChange={e => setWindowValue(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {windowOptions.map(opt => (
            <option key={opt} value={opt}>{opt}h</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">Model Quality: <b>{modelQuality}</b></span>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ForecastAreaChart; 