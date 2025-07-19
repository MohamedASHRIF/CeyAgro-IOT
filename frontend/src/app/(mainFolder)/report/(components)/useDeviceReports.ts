"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface DeviceData {
  id: string;
  name: string;
  temperatureValue?: string;
  humidityValue?: string;
  date: string;
  deviceId: string;
  isActive?: boolean;
}

interface ReportResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    expiresIn: number;
    recordCount: number;
  };
}

interface DownloadHistory {
  filename: string;
  downloadUrl: string;
  createdAt: string;
  recordCount: number;
}

interface Device {
  deviceId: string;
  deviceName: string;
}

export function useDeviceReports(userEmail: string) {
  const [deviceName, setDeviceName] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [deviceNames, setDeviceNames] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem(`downloadHistory_${userEmail}`);
      if (storedHistory) {
        setDownloadHistory(JSON.parse(storedHistory));
      }
    }
  }, [userEmail]);

  useEffect(() => {
    if (isMounted && downloadHistory.length > 0) {
      localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(downloadHistory));
    }
  }, [downloadHistory, isMounted, userEmail]);

<<<<<<< Updated upstream
  useEffect(() => {
    const fetchDeviceNames = async () => {
      try {
        console.log('Fetching user device names for email:', userEmail);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/device-names`, {
          params: { email: userEmail },
        });
        if (response.data.success) {
          const names = response.data.data || [];
          setDeviceNames(names);
          if (names.length > 0 && !deviceName) {
            setDeviceName(names[0]); // Auto-select first device
          }
        } else {
          setError(response.data.message || 'Failed to fetch user devices');
          setDeviceNames([]);
          toast.error('Error', { description: response.data.message || 'Failed to fetch user devices' });
        }
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Failed to fetch user devices';
        console.error('Error fetching device names:', message);
        setError(message);
        setDeviceNames([]);
        toast.error('Error', { description: message });
      }
    };
    if (isMounted && userEmail) {
      fetchDeviceNames();
    }
  }, [isMounted, userEmail]);
=======
>>>>>>> Stashed changes

  useEffect(() => {
  const fetchDeviceNames = async () => {
    try {
      console.log('Fetching user device list for email:', userEmail);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-device-list`, {
        params: { email: userEmail },
      });
      if (response.data.success) {
        const devices = (response.data.data || []).map((device: Device) => ({
          deviceId: device.deviceId,
          deviceName: device.deviceName.trim(), // Trim deviceName
        }));
        if (devices.length === 0) {
          console.warn('No devices found for user:', userEmail);
          setError('No devices found for your account');
          toast.error('Error', { description: 'No devices found for your account' });
        } else {
          setDeviceNames(devices);
          if (!deviceName && devices.length > 0) {
            const firstDevice = devices[0];
            if (!firstDevice.deviceName || !firstDevice.deviceId) {
              console.warn('Invalid device data:', firstDevice);
              setError('Invalid device data returned from server');
              toast.error('Error', { description: 'Invalid device data returned from server' });
            } else {
              setDeviceName(firstDevice.deviceName);
              setDeviceId(firstDevice.deviceId);
            }
          }
        }
      } else {
        setError(response.data.message || 'Failed to fetch user devices');
        setDeviceNames([]);
        toast.error('Error', { description: response.data.message || 'Failed to fetch user devices' });
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to fetch user devices';
      console.error('Error fetching device list:', message);
      setError(message);
      setDeviceNames([]);
      toast.error('Error', { description: message });
    }
  };
  if (isMounted && userEmail) {
    fetchDeviceNames();
  }
}, [isMounted, userEmail]);

  useEffect(() => {
    if (isMounted && deviceId && startDate && endDate && userEmail) {
      fetchDeviceData();
    }
  }, [isMounted, deviceId, startDate, endDate, userEmail]);

  const fetchDeviceData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching device data with params:', {
        deviceId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        email: userEmail,
      });
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/readings`, {
        params: {
          deviceId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          email: userEmail,
        },
      });
      console.log('Backend response:', response.data);
      if (response.data.success) {
        const transformedData = (response.data.data.readings || []).map((item: any) => ({
          ...item,
          temperatureValue: item.temperatureValue != null ? String(item.temperatureValue) : undefined,
          humidityValue: item.humidityValue != null ? String(item.humidityValue) : undefined,
          name: item.name || deviceName, // Use backend-provided name or fallback to selected deviceName
        }));
        setDeviceData(transformedData);
        if (transformedData.length === 0) {
          setError(`No data found for device "${deviceName}" in the selected date range`);
          toast.info('No Data', { description: `No data found for device "${deviceName}" in the selected date range` });
        }
      } else {
        let errorMessage = response.data.message;
        if (errorMessage === '["deviceId must be a string"]') {
          errorMessage = 'Invalid device ID format in the database. Please contact support.';
        } else if (errorMessage.includes('not found for the user') || errorMessage.includes('not associated with user')) {
          errorMessage = `Device "${deviceName}" is not available for your account. Please select a different device.`;
        }
        setError(errorMessage);
        setDeviceData([]);
        toast.error('Error', { description: errorMessage });
      }
    } catch (error) {
      let message = 'Failed to fetch device data';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
        if (message === '["deviceId must be a string"]') {
          message = 'Invalid device ID format in the database. Please contact support.';
        } else if (message.includes('not found for the user') || message.includes('not associated with user')) {
          message = `Device "${deviceName}" is not available for your account. Please select a different device.`;
        }
      }
      console.error('Error fetching device data:', message);
      setError(message);
      setDeviceData([]);
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setError('');
    try {
      const response = await axios.post<ReportResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/export`,
        null,
        {
          params: {
            deviceId,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
            email: userEmail,
          },
        }
      );
      if (response.data.success) {
        setDownloadUrl(response.data.data.downloadUrl);
        setRecordCount(response.data.data.recordCount);
        toast.success('Report generated', {
          description: 'Your report has been generated successfully.',
        });
      } else {
        setError(response.data.message || 'Failed to generate report');
        toast.error('Error', { description: response.data.message || 'Failed to generate report' });
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to generate report';
      console.error('Error generating report:', message);
      setError(message);
      toast.error('Error', { description: message });
    } finally {
      setGeneratingReport(false);
    }
  };

  const isUrlExpired = (createdAt: string): boolean => {
    try {
      const createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) return true;
      const now = new Date();
      const expiresInSeconds = 1800;
      const timeDiffSeconds = (now.getTime() - createdDate.getTime()) / 1000;
      return timeDiffSeconds > expiresInSeconds;
    } catch {
      return true;
    }
  };

  const handleDownloadClick = (downloadUrl: string, createdAt: string): void => {
    if (isUrlExpired(createdAt)) {
      setShowExpiredDialog(true);
      return;
    }
    if (downloadUrl && recordCount !== null) {
      const newHistoryItem: DownloadHistory = {
        filename: `device-report-${deviceName}-${new Date().toISOString().split('T')[0]}.xlsx`,
        downloadUrl,
        createdAt: new Date().toISOString(),
        recordCount,
      };
      setDownloadHistory((prev) => [newHistoryItem, ...prev].slice(0, 10));
      setTimeout(() => {
        setDownloadUrl('');
        setRecordCount(null);
      }, 1000);
    }
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteHistory = (index: number) => {
    setDownloadHistory((prev) => {
      const updatedHistory = prev.filter((_, i) => i !== index);
      if (updatedHistory.length === 0) {
        localStorage.removeItem(`downloadHistory_${userEmail}`);
      } else {
        localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
  };

  const extractS3KeyFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const analyticsIndex = pathParts.findIndex((part) => part === 'analytics');
      if (analyticsIndex >= 0) {
        return pathParts.slice(analyticsIndex).join('/');
      }
      return `analytics/${pathParts[pathParts.length - 1]}`;
    } catch (error) {
      console.error('Error extracting S3 key:', error);
      const parts = url.split('/');
      const filename = parts[parts.length - 1].split('?')[0];
      return `analytics/${filename}`;
    }
  };

  const handlePermanentDelete = async (index: number) => {
    setCurrentIndex(index);
    setIsDeleting(true);
    setDeleteErrorMessage('');
    try {
      const item = downloadHistory[index];
      const s3Key = extractS3KeyFromUrl(item.downloadUrl);
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/analytics/files`, {
        params: { key: s3Key },
      });
      if (response.data.success) {
        handleDeleteHistory(index);
        toast.success('File deleted', {
          description: 'The file has been permanently deleted',
        });
        setShowConfirmDialog(false);
      } else {
        setDeleteErrorMessage(response.data.message || 'Failed to delete file');
        toast.error('Error', { description: response.data.message || 'Failed to delete file' });
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to delete file';
      console.error('Error deleting file:', message);
      setDeleteErrorMessage(message);
      toast.error('Error', { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (index: number) => {
    setCurrentIndex(index);
    setShowConfirmDialog(true);
    setDeleteErrorMessage('');
  };

  const handleClearForm = () => {
    setDeviceName('');
    setDeviceId('');
    setStartDate(undefined);
    setEndDate(undefined);
    setDeviceData([]);
    setDownloadUrl('');
    setRecordCount(null);
    setError('');
  };

  return {
    deviceName,
    setDeviceName,
    deviceId,
    setDeviceId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    deviceData,
    deviceNames,
    loading,
    downloadUrl,
    error,
    downloadHistory,
    generatingReport,
    handleGenerateReport,
    handleDownloadClick,
    handleDeleteHistory,
    handleClearForm,
    isMounted,
    handlePermanentDelete,
    confirmDelete,
    isDeleting,
    currentIndex,
    showConfirmDialog,
    setShowConfirmDialog,
    deleteErrorMessage,
    showExpiredDialog,
    setShowExpiredDialog,
  };
}