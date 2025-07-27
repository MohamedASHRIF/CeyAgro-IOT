import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  Dimensions, 
  Text as RNText, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Platform,
  SafeAreaView,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Card, Text } from "react-native-paper";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import { useAuth0 } from 'react-native-auth0';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;
const chartWidth = Math.min(screenWidth - 32, 400);

// --- Gauge Chart Component ---
function GaugeChart({ value = 0, min = 0, max = 100, label = "Temperature" }) {
  const radius = 70;
  const strokeWidth = 18;
  const center = radius + strokeWidth;
  const normalizedValue = Math.max(min, Math.min(max, value));
  const angle = ((normalizedValue - min) / (max - min)) * 180;
  const startAngle = Math.PI;
  const endAngle = Math.PI + (angle * Math.PI) / 180;
  const x1 = center + radius * Math.cos(startAngle);
  const y1 = center + radius * Math.sin(startAngle);
  const x2 = center + radius * Math.cos(endAngle);
  const y2 = center + radius * Math.sin(endAngle);
  const largeArcFlag = angle > 180 ? 1 : 0;
  const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  
  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <Svg width={center * 2} height={center + 20}>
        <Path 
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 1 1 ${center + radius} ${center}`} 
          stroke="#E2E8F0" 
          strokeWidth={strokeWidth} 
          fill="none" 
        />
        <Path 
          d={arcPath} 
          stroke="#1ACDB6" 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeLinecap="round" 
        />
        <SvgText 
          x={center} 
          y={center} 
          fontSize="32" 
          fontWeight="700" 
          fontFamily="Inter"
          fill="#1E293B" 
          textAnchor="middle" 
          alignmentBaseline="middle"
        >
          {normalizedValue}
        </SvgText>
        <SvgText 
          x={center} 
          y={center + 40} 
          fontSize="16" 
          fontWeight="500"
          fontFamily="Inter"
          fill="#475569" 
          textAnchor="middle"
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#F8FAFC",
  backgroundGradientTo: "#F8FAFC",
  decimalPlaces: 1,
  color: () => "#1ACDB6",
  labelColor: () => "#475569",
  style: { borderRadius: 12 },
  propsForLabels: { fontSize: 12, fontFamily: "Inter" },
  barPercentage: 0.5,
  fillShadowGradient: "#1ACDB6",
  fillShadowGradientOpacity: 1,
};

const timeRanges = [
  { label: "Last 1 Hour", value: "lastHour" },
  { label: "Last 24 Hours", value: "lastDay" },
  { label: "Last Week", value: "lastWeek" },
];

const API_BASE =
  (Platform.OS === "android"
    ? "http://uom-project-primary-738156088.eu-north-1.elb.amazonaws.com/analytics-api"
    : "http://10.0.2.2:3003") + "/analytics";

interface MetricType {
  label: string;
  value: string;
  min: number;
  max: number;
}

export default function VisualizationScreen() {
  const { user, isLoading: authLoading } = useAuth0();
  
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [metrics, setMetrics] = useState<MetricType[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [metricDetails, setMetricDetails] = useState({ min: 0, max: 100, label: "" });
  const [historyRange, setHistoryRange] = useState("lastHour");
  const [barRange, setBarRange] = useState("lastHour");

  const [gaugeValue, setGaugeValue] = useState<number | null>(null);
  const [gaugeTimestamp, setGaugeTimestamp] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{ labels: string[]; datasets: { data: number[]; color?: () => string }[] } | null>(null);
  const [barData, setBarData] = useState<{ labels: string[]; datasets: { data: number[] }[] } | null>(null);

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingGauge, setLoadingGauge] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingBar, setLoadingBar] = useState(false);
  const [error, setError] = useState("");

  const userEmail = user?.email;

  useFocusEffect(
    React.useCallback(() => {
      if (userEmail && !loadingDevices) {
        fetchDevices();
      }
      return () => {};
    }, [userEmail])
  );

  const fetchDevices = async () => {
    if (!userEmail) return;
    
    try {
      setLoadingDevices(true);
      setError("");
      const response = await fetch(`${API_BASE}/user-device-list?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const deviceList = data.data || [];
        setDevices(deviceList.map((device: any) => device.deviceId));
        if (deviceList.length > 0) {
          setSelectedDevice(deviceList[0].deviceId);
        }
      } else {
        setError(`Failed to load devices: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError("Failed to load devices: Network error");
      console.error('Device fetch error:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Header showBackButton={false} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1ACDB6" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || !userEmail) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Header showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Authentication Required</Text>
          <Text style={styles.errorSubText}>Please log in to access this feature</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (userEmail) {
      fetchDevices();
    }
  }, [userEmail]);

  useEffect(() => {
    if (!selectedDevice || !userEmail) return;
    
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const response = await fetch(`${API_BASE}/device-types?deviceId=${encodeURIComponent(selectedDevice)}&email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          const types = (data.data || []).map((t: any) => ({
            label: t.type,
            value: t.type.toLowerCase(),
            min: t.minValue || 0,
            max: t.maxValue || 100,
          }));
          setMetrics(types);
          if (types.length > 0) {
            setSelectedMetric(types[0].value);
            setMetricDetails({
              min: types[0].min,
              max: types[0].max,
              label: types[0].label,
            });
          } else {
            setSelectedMetric("");
            setMetricDetails({ min: 0, max: 100, label: "" });
          }
        }
      } catch (err) {
        console.error('Metrics fetch error:', err);
        setMetrics([]);
        setSelectedMetric("");
        setMetricDetails({ min: 0, max: 100, label: "" });
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [selectedDevice, userEmail]);

  useEffect(() => {
    if (!selectedMetric || metrics.length === 0) return;
    const found = metrics.find((m) => m.value === selectedMetric);
    if (found) {
      setMetricDetails({ min: found.min, max: found.max, label: found.label });
    }
  }, [selectedMetric, metrics]);

  useEffect(() => {
    if (!selectedDevice || !selectedMetric || !userEmail) return;
    
    const fetchGaugeData = async () => {
      try {
        setLoadingGauge(true);
        const response = await fetch(`${API_BASE}/realtime/${encodeURIComponent(selectedDevice)}?metric=${encodeURIComponent(selectedMetric)}&email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (response.ok) {
          setGaugeValue(data?.value ?? null);
          setGaugeTimestamp(data?.timestamp ?? null);
        } else {
          setGaugeValue(null);
          setGaugeTimestamp(null);
        }
      } catch (err) {
        console.error('Gauge data fetch error:', err);
        setGaugeValue(null);
        setGaugeTimestamp(null);
      } finally {
        setLoadingGauge(false);
      }
    };

    fetchGaugeData();
    
    // Set up polling for real-time data
    const interval = setInterval(fetchGaugeData, 5000);
    return () => clearInterval(interval);
  }, [selectedDevice, selectedMetric, userEmail]);

  useEffect(() => {
    if (!selectedDevice || !selectedMetric || !userEmail) return;
    
    const fetchHistoryData = async () => {
      try {
        setLoadingHistory(true);
        const now = new Date();
        let startDate: Date;
        
        if (historyRange === "lastHour") {
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
        } else if (historyRange === "lastDay") {
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        
        const response = await fetch(`${API_BASE}/history/${encodeURIComponent(selectedDevice)}?metric=${encodeURIComponent(selectedMetric)}&startDate=${startDate.toISOString()}&endDate=${now.toISOString()}&email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (response.ok) {
          const points = Array.isArray(data) ? data : (data?.data || []);
          if (points.length > 0) {
            setHistoryData({
              labels: points.map((v: any) => {
                const date = new Date(v.timestamp || v.label);
                return date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'Asia/Colombo'
                });
              }),
              datasets: [{ data: points.map((v: any) => v.value || 0), color: () => "#1ACDB6" }],
            });
          } else {
            setHistoryData(null);
          }
        } else {
          setHistoryData(null);
        }
      } catch (err) {
        console.error('History data fetch error:', err);
        setHistoryData(null);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistoryData();
  }, [selectedDevice, selectedMetric, historyRange, userEmail]);

  useEffect(() => {
    if (!selectedDevice || !selectedMetric || !userEmail) return;
    
    const fetchBarData = async () => {
      try {
        setLoadingBar(true);
        
        const response = await fetch(`${API_BASE}/stats/${encodeURIComponent(selectedDevice)}?metric=${encodeURIComponent(selectedMetric)}&timeRange=${barRange}&email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (response.ok) {
          const stats = data || { min: 0, max: 0, avg: 0 };
          setBarData({
            labels: ["Min", "Max", "Avg"],
            datasets: [{ data: [stats.min || 0, stats.max || 0, stats.avg || 0] }],
          });
        } else {
          setBarData(null);
        }
      } catch (err) {
        console.error('Bar data fetch error:', err);
        setBarData(null);
      } finally {
        setLoadingBar(false);
      }
    };

    fetchBarData();
  }, [selectedDevice, selectedMetric, barRange, userEmail]);

  return (
    <SafeAreaView style={styles.container}>
      <Header showBackButton={false} />
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Data Visualization Header */}
        <View style={styles.headerCard}>
          <Ionicons name="analytics-outline" size={32} color="#1ACDB6" />
          <Text style={styles.headerTitle}>Data Visualization</Text>
          <Text style={styles.headerSubtitle}>Monitor and analyze device metrics in real-time</Text>
        </View>

        {/* Device and Metric Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Select Device & Metric</Text>
            {loadingDevices ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1ACDB6" />
                <Text style={styles.loadingText}>Loading devices...</Text>
              </View>
            ) : devices.length === 0 ? (
              <Text style={styles.noDataText}>No devices found for this user.</Text>
            ) : (
              <View style={styles.selectionRow}>
                <View style={styles.selectionCol}>
                  <Text style={styles.selectionLabel}>Device:</Text>
                  <View style={styles.selectionOptions}>
                    {devices.map((dev) => (
                      <TouchableOpacity
                        key={dev}
                        style={[styles.toggleButton, selectedDevice === dev && styles.toggleButtonActive]}
                        onPress={() => setSelectedDevice(dev)}
                      >
                        <RNText style={[styles.toggleButtonText, selectedDevice === dev && styles.toggleButtonTextActive]}>
                          {dev}
                        </RNText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.selectionCol}>
                  <Text style={styles.selectionLabel}>Metric:</Text>
                  {loadingMetrics ? (
                    <ActivityIndicator size="small" color="#1ACDB6" />
                  ) : metrics.length === 0 ? (
                    <Text style={styles.noDataText}>No metrics found for this device.</Text>
                  ) : (
                    <View style={styles.selectionOptions}>
                      {metrics.map((m) => (
                        <TouchableOpacity
                          key={m.value}
                          style={[styles.toggleButton, selectedMetric === m.value && styles.toggleButtonActive]}
                          onPress={() => {
                            setSelectedMetric(m.value);
                            setMetricDetails({ min: m.min, max: m.max, label: m.label });
                          }}
                        >
                          <RNText style={[styles.toggleButtonText, selectedMetric === m.value && styles.toggleButtonTextActive]}>
                            {m.label}
                          </RNText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Gauge Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Real-Time {metricDetails.label}</Text>
            {loadingGauge ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1ACDB6" />
                <Text style={styles.loadingText}>Loading real-time data...</Text>
              </View>
            ) : gaugeValue !== null ? (
              <>
                <GaugeChart 
                  value={gaugeValue} 
                  min={metricDetails.min} 
                  max={metricDetails.max} 
                  label={metricDetails.label} 
                />
                {gaugeTimestamp && (
                  <Text style={styles.timestampText}>
                    Last updated: {new Date(gaugeTimestamp).toLocaleString("en-US", { timeZone: "Asia/Colombo" })}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.noDataText}>No real-time data available.</Text>
            )}
          </Card.Content>
        </Card>

        {/* History Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>History</Text>
              <View style={styles.toggleContainer}>
                {timeRanges.map((tr) => (
                  <TouchableOpacity
                    key={tr.value}
                    style={[styles.toggleButton, historyRange === tr.value && styles.toggleButtonActive]}
                    onPress={() => setHistoryRange(tr.value)}
                  >
                    <RNText style={[styles.toggleButtonText, historyRange === tr.value && styles.toggleButtonTextActive]}>
                      {tr.label}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1ACDB6" />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : historyData && historyData.datasets[0].data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={historyData}
                  width={Math.max(chartWidth, historyData.labels.length * 50)}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix={metricDetails.label === "Temperature" ? "°C" : metricDetails.label === "Humidity" ? "%" : ""}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero={true}
                  bezier
                />
              </ScrollView>
            ) : (
              <Text style={styles.noDataText}>No historical data found.</Text>
            )}
          </Card.Content>
        </Card>

        {/* Bar Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>Statistics</Text>
              <View style={styles.toggleContainer}>
                {timeRanges.map((tr) => (
                  <TouchableOpacity
                    key={tr.value}
                    style={[styles.toggleButton, barRange === tr.value && styles.toggleButtonActive]}
                    onPress={() => setBarRange(tr.value)}
                  >
                    <RNText style={[styles.toggleButtonText, barRange === tr.value && styles.toggleButtonTextActive]}>
                      {tr.label}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {loadingBar ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1ACDB6" />
                <Text style={styles.loadingText}>Loading statistics...</Text>
              </View>
            ) : barData && barData.datasets[0].data.some(v => v !== 0) ? (
              <BarChart
                data={barData}
                width={chartWidth}
                height={220}
                yAxisLabel=""
                yAxisSuffix={metricDetails.label === "Temperature" ? "°C" : metricDetails.label === "Humidity" ? "%" : ""}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero={true}
                showValuesOnTopOfBars={true}
              />
            ) : (
              <Text style={styles.noDataText}>No statistics data for this period.</Text>
            )}
          </Card.Content>
        </Card>
        
        {error ? (
          <Card style={[styles.card, styles.errorCard]}>
            <Card.Content>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
    alignItems: "center",
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 8,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardTitle: {
    color: "#1E293B",
    fontWeight: "700",
    fontFamily: "Inter",
    fontSize: 18,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    marginRight: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: "#1ACDB6",
  },
  toggleButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontFamily: "Inter",
    fontSize: 12,
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  selectionRow: {
    flexDirection: "column",
    width: "100%",
    gap: 16,
  },
  selectionCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  selectionLabel: {
    fontWeight: "700",
    fontFamily: "Inter",
    marginBottom: 8,
    fontSize: 16,
    color: "#1E293B",
  },
  selectionOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#475569",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
    color: "#EF4444",
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#475569",
    textAlign: "center",
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "#475569",
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  timestampText: {
    textAlign: "center",
    color: "#475569",
    fontFamily: "Inter",
    marginTop: 8,
    fontSize: 12,
  },
}); 