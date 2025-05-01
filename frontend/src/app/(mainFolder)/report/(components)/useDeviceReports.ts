import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface DeviceData {
  id: string;
  name: string;
  temperatureValue?: string;
  humidityValue?: string;
  date: string;
  location?: string;
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


export function useDeviceReports() {
 
  const [deviceName, setDeviceName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [deviceNames, setDeviceNames] = useState<string[]>([]);
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

  // Load download history from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('downloadHistory');
      if (storedHistory) {
        setDownloadHistory(JSON.parse(storedHistory));
      }
    }
  }, []);

  // Save download history to localStorage whenever it changes
  useEffect(() => {
    if (isMounted && downloadHistory.length > 0) {
      localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
    }
  }, [downloadHistory, isMounted]);

  // Fetch available device names from the backend
  useEffect(() => {
    const fetchDeviceNames = async () => {
      try {
        console.log('Fetching device names from backend');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/names`);
        console.log('Device names received:', response.data);
        setDeviceNames(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', {
            status: error.response?.status,
            data: error.response?.data,
          });
          setError(`Failed to fetch device names: ${error.message}`);
        } else {
          console.error('Unexpected Error:', error);
          setError('Failed to fetch device names');
        }
      }
    };
    if (isMounted) {
      fetchDeviceNames();
    }
  }, [isMounted]);

  // Fetch device data when deviceName, startDate, or endDate changes
  useEffect(() => {
    if (isMounted && deviceName && startDate && endDate) {
      fetchDeviceData();
    }
  }, [isMounted, deviceName, startDate, endDate]);

  // Fetch device readings based on selected device and date range
  const fetchDeviceData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/readings`, {
        params: {
          name: deviceName,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });
      if (response.data.success) {
        setDeviceData(response.data.data.readings);
      } else {
        setError(response.data.message);
        setDeviceData([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Failed to fetch device data: ${error.message}`);
      } else {
        console.error('Unexpected Error:', error);
        setError('Failed to fetch device data');
      }
      setDeviceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate a report via the backend and store the download URL
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setError('');
    try {
      const response = await axios.post<ReportResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/export`,
        null,
        {
          params: {
            name: deviceName,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        }
      );
      if (response.data.success) {
        setDownloadUrl(response.data.data.downloadUrl);
        setRecordCount(response.data.data.recordCount);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(`Failed to generate report: ${error.message}`);
      } else {
        console.error('Unexpected Error:', error);
        setError('Failed to generate report');
      }
    } finally {
      setGeneratingReport(false);
    }
  };
// Function to check if the signed URL is expired (30 minutes = 1800 seconds)
const isUrlExpired = (createdAt: string): boolean => {
  try {
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return true; // Treat invalid dates as expired
    const now = new Date();
    const expiresInSeconds = 1800; // Matches backend's expiresIn
    const timeDiffSeconds = (now.getTime() - createdDate.getTime()) / 1000;
    return timeDiffSeconds > expiresInSeconds;
  } catch {
    return true; // Fallback to expired
  }
};

// Handle download click with expiration check and history update
const handleDownloadClick = (downloadUrl: string, createdAt: string): void => {
  if (isUrlExpired(createdAt)) {
    setShowExpiredDialog(true); // Show expiration alert
  } else {
    // Update download history
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
    // Trigger download programmatically
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

  
  // Remove a specific history item from download history
  const handleDeleteHistory = (index: number) => {
    setDownloadHistory((prev) => {
      const updatedHistory = prev.filter((_, i) => i !== index);
      if (updatedHistory.length === 0) {
        localStorage.removeItem('downloadHistory');
      } else {
        localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
      }
      return updatedHistory;
    });
  };


  // Extract S3 key from download URL
  const extractS3KeyFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const analyticsIndex = pathParts.findIndex(part => part === 'analytics');
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

  // Handle permanent file deletion
  const handlePermanentDelete = async (index: number) => {
    setCurrentIndex(index);
    setIsDeleting(true);
    setDeleteErrorMessage('');
    
    try {
      const item = downloadHistory[index];
      const s3Key = extractS3KeyFromUrl(item.downloadUrl);
      console.log('Attempting to delete file with key:', s3Key);
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/files`, 
        { params: { key: s3Key } }
      );
      
      if (response.data.success) {
        handleDeleteHistory(index);
        toast.success("File deleted", {
          description: "The file has been permanently deleted",
        });
        setShowConfirmDialog(false); 
      } else {
        setDeleteErrorMessage(response.data.message || 'Failed to delete file');
        toast.error("Error", {
          description: response.data.message || 'Failed to delete file',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      let errorMessage = 'Failed to delete file';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      setDeleteErrorMessage(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };



  // Handle opening confirmation dialog
  const confirmDelete = (index: number) => {
    setCurrentIndex(index);
    setShowConfirmDialog(true);
    setDeleteErrorMessage(''); 
  };




  // Reset all form and data states
  const handleClearForm = () => {
    setDeviceName('');
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






