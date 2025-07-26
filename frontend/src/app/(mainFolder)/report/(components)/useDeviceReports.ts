<<<<<<< Updated upstream
=======
// // "use client";
// // import { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { toast } from 'sonner';

// // interface DeviceData {
// //   id: string;
// //   name: string;
// //   temperatureValue?: string;
// //   humidityValue?: string;
// //   date: string;
// //   deviceId: string;
// //   isActive?: boolean;
// // }

// // interface ReportResponse {
// //   success: boolean;
// //   message: string;
// //   data: {
// //     downloadUrl: string;
// //     expiresIn: number;
// //     recordCount: number;
// //   };
// // }

// // interface DownloadHistory {
// //   filename: string;
// //   downloadUrl: string;
// //   createdAt: string;
// //   recordCount: number;
// // }

// // interface Device {
// //   deviceId: string;
// //   deviceName: string;
// // }

// // export function useDeviceReports(userEmail: string) {
// //   const [deviceName, setDeviceName] = useState<string>('');
// //   const [deviceId, setDeviceId] = useState<string>('');
// //   const [startDate, setStartDate] = useState<Date | undefined>(undefined);
// //   const [endDate, setEndDate] = useState<Date | undefined>(undefined);
// //   const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
// //   const [deviceNames, setDeviceNames] = useState<Device[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [downloadUrl, setDownloadUrl] = useState('');
// //   const [recordCount, setRecordCount] = useState<number | null>(null);
// //   const [error, setError] = useState('');
// //   const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
// //   const [generatingReport, setGeneratingReport] = useState(false);
// //   const [isMounted, setIsMounted] = useState(false);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [currentIndex, setCurrentIndex] = useState<number | null>(null);
// //   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
// //   const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
// //   const [showExpiredDialog, setShowExpiredDialog] = useState(false);

// //   useEffect(() => {
// //     setIsMounted(true);
// //     if (typeof window !== 'undefined') {
// //       const storedHistory = localStorage.getItem(`downloadHistory_${userEmail}`);
// //       if (storedHistory) {
// //         setDownloadHistory(JSON.parse(storedHistory));
// //       }
// //     }
// //   }, [userEmail]);

// //   useEffect(() => {
// //     if (isMounted && downloadHistory.length > 0) {
// //       localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(downloadHistory));
// //     }
// //   }, [downloadHistory, isMounted, userEmail]);

// //   useEffect(() => {
// //     const fetchDeviceNames = async () => {
// //       try {
// //         console.log('Fetching user device list for email:', userEmail);
// //         const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-device-list`, {
// //           params: { email: userEmail },
// //         });
// //         if (response.data.success) {
// //           const devices = (response.data.data || []).map((device: Device) => ({
// //             deviceId: device.deviceId?.trim(),
// //             deviceName: device.deviceName?.trim(),
// //           })).filter((device: Device) => device.deviceId && device.deviceName); // Filter out invalid devices
// //           if (devices.length === 0) {
// //             console.warn('No valid devices found for user:', userEmail);
// //             setError('No devices found for your account');
// //             toast.error('Error', { description: 'No devices found for your account' });
// //             setDeviceNames([]);
// //             setDeviceName('');
// //             setDeviceId('');
// //           } else {
// //             setDeviceNames(devices);
// //             if (!deviceName || !devices.some((d: Device) => d.deviceName === deviceName)) {
// //               const firstDevice = devices[0];
// //               setDeviceName(firstDevice.deviceName);
// //               setDeviceId(firstDevice.deviceId);
// //               console.log('Selected first device:', firstDevice);
// //             }
// //           }
// //         } else {
// //           setError(response.data.message || 'Failed to fetch user devices');
// //           setDeviceNames([]);
// //           toast.error('Error', { description: response.data.message || 'Failed to fetch user devices' });
// //         }
// //       } catch (error) {
// //         const message = axios.isAxiosError(error)
// //           ? error.response?.data?.message || error.message
// //           : 'Failed to fetch user devices';
// //         console.error('Error fetching device list:', message);
// //         setError(message);
// //         setDeviceNames([]);
// //         setDeviceName('');
// //         setDeviceId('');
// //         toast.error('Error', { description: message });
// //       }
// //     };
// //     if (isMounted && userEmail) {
// //       fetchDeviceNames();
// //     }
// //   }, [isMounted, userEmail]);

// //   useEffect(() => {
// //     if (isMounted && deviceId && startDate && endDate && userEmail) {
// //       fetchDeviceData();
// //     }
// //   }, [isMounted, deviceId, startDate, endDate, userEmail]);

// //   const fetchDeviceData = async () => {
// //     setLoading(true);
// //     setError('');
// //     try {
// //       console.log('Fetching device data with params:', {
// //         deviceId,
// //         deviceName,
// //         startDate: startDate?.toISOString(),
// //         endDate: endDate?.toISOString(),
// //         email: userEmail,
// //       });
// //       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/readings`, {
// //         params: {
// //           deviceId,
// //           startDate: startDate?.toISOString(),
// //           endDate: endDate?.toISOString(),
// //           email: userEmail,
// //         },
// //       });
// //       console.log('Backend response:', response.data);
// //       if (response.data.success) {
// //         const transformedData = (response.data.data.readings || []).map((item: any) => ({
// //           ...item,
// //           temperatureValue: item.temperatureValue != null ? String(item.temperatureValue) : undefined,
// //           humidityValue: item.humidityValue != null ? String(item.humidityValue) : undefined,
// //           name: deviceName, // Use the selected deviceName from state
// //         }));
// //         setDeviceData(transformedData);
// //         if (transformedData.length === 0) {
// //           setError(`No data found for device "${deviceName}" in the selected date range`);
// //           toast.info('No Data', { description: `No data found for device "${deviceName}" in the selected date range` });
// //         }
// //       } else {
// //         let errorMessage = response.data.message;
// //         if (errorMessage === '["deviceId must be a string"]') {
// //           errorMessage = 'Invalid device ID format in the database. Please contact support.';
// //         } else if (errorMessage.includes('not found for the user') || errorMessage.includes('not associated with user')) {
// //           errorMessage = `Device "${deviceName}" is not available for your account. Please select a different device.`;
// //         }
// //         setError(errorMessage);
// //         setDeviceData([]);
// //         toast.error('Error', { description: errorMessage });
// //       }
// //     } catch (error) {
// //       let message = 'Failed to fetch device data';
// //       if (axios.isAxiosError(error)) {
// //         message = error.response?.data?.message || error.message;
// //         if (message === '["deviceId must be a string"]') {
// //           message = 'Invalid device ID format in the database. Please contact support.';
// //         } else if (message.includes('not found for the user') || message.includes('not associated with user')) {
// //           message = `Device "${deviceName}" is not available for your account. Please select a different device.`;
// //         }
// //       }
// //       console.error('Error fetching device data:', message);
// //       setError(message);
// //       setDeviceData([]);
// //       toast.error('Error', { description: message });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleGenerateReport = async () => {
// //     setGeneratingReport(true);
// //     setError('');
// //     try {
// //       console.log('Generating report with params:', {
// //         deviceId,
// //         deviceName,
// //         startDate: startDate?.toISOString(),
// //         endDate: endDate?.toISOString(),
// //         email: userEmail,
// //       });
// //       const response = await axios.post<ReportResponse>(
// //         `${process.env.NEXT_PUBLIC_API_URL}/analytics/export`,
// //         null,
// //         {
// //           params: {
// //             deviceId,
// //             startDate: startDate?.toISOString(),
// //             endDate: endDate?.toISOString(),
// //             email: userEmail,
// //           },
// //         }
// //       );
// //       if (response.data.success) {
// //         setDownloadUrl(response.data.data.downloadUrl);
// //         setRecordCount(response.data.data.recordCount);
// //         toast.success('Report generated', {
// //           description: 'Your report has been generated successfully.',
// //         });
// //       } else {
// //         setError(response.data.message || 'Failed to generate report');
// //         toast.error('Error', { description: response.data.message || 'Failed to generate report' });
// //       }
// //     } catch (error) {
// //       const message = axios.isAxiosError(error)
// //         ? error.response?.data?.message || error.message
// //         : 'Failed to generate report';
// //       console.error('Error generating report:', message);
// //       setError(message);
// //       toast.error('Error', { description: message });
// //     } finally {
// //       setGeneratingReport(false);
// //     }
// //   };

// //   const isUrlExpired = (createdAt: string): boolean => {
// //     try {
// //       const createdDate = new Date(createdAt);
// //       if (isNaN(createdDate.getTime())) return true;
// //       const now = new Date();
// //       const expiresInSeconds = 1800;
// //       const timeDiffSeconds = (now.getTime() - createdDate.getTime()) / 1000;
// //       return timeDiffSeconds > expiresInSeconds;
// //     } catch {
// //       return true;
// //     }
// //   };

// //   const handleDownloadClick = (downloadUrl: string, createdAt: string): void => {
// //     if (isUrlExpired(createdAt)) {
// //       setShowExpiredDialog(true);
// //       return;
// //     }
// //     if (downloadUrl && recordCount !== null) {
// //       const newHistoryItem: DownloadHistory = {
// //         filename: `device-report-${deviceName}-${new Date().toISOString().split('T')[0]}.xlsx`,
// //         downloadUrl,
// //         createdAt: new Date().toISOString(),
// //         recordCount,
// //       };
// //       setDownloadHistory((prev) => [newHistoryItem, ...prev].slice(0, 10));
// //       setTimeout(() => {
// //         setDownloadUrl('');
// //         setRecordCount(null);
// //       }, 1000);
// //     }
// //     const link = document.createElement('a');
// //     link.href = downloadUrl;
// //     link.download = '';
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //   };

// //   const handleDeleteHistory = (index: number) => {
// //     setDownloadHistory((prev) => {
// //       const updatedHistory = prev.filter((_, i) => i !== index);
// //       if (updatedHistory.length === 0) {
// //         localStorage.removeItem(`downloadHistory_${userEmail}`);
// //       } else {
// //         localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(updatedHistory));
// //       }
// //       return updatedHistory;
// //     });
// //   };

// //   const extractS3KeyFromUrl = (url: string): string => {
// //     try {
// //       const urlObj = new URL(url);
// //       const pathParts = urlObj.pathname.split('/');
// //       const analyticsIndex = pathParts.findIndex((part) => part === 'analytics');
// //       if (analyticsIndex >= 0) {
// //         return pathParts.slice(analyticsIndex).join('/');
// //       }
// //       return `analytics/${pathParts[pathParts.length - 1]}`;
// //     } catch (error) {
// //       console.error('Error extracting S3 key:', error);
// //       const parts = url.split('/');
// //       const filename = parts[parts.length - 1].split('?')[0];
// //       return `analytics/${filename}`;
// //     }
// //   };

// //   const handlePermanentDelete = async (index: number) => {
// //     setCurrentIndex(index);
// //     setIsDeleting(true);
// //     setDeleteErrorMessage('');
// //     try {
// //       const item = downloadHistory[index];
// //       const s3Key = extractS3KeyFromUrl(item.downloadUrl);
// //       const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/analytics/files`, {
// //         params: { key: s3Key },
// //       });
// //       if (response.data.success) {
// //         handleDeleteHistory(index);
// //         toast.success('File deleted', {
// //           description: 'The file has been permanently deleted',
// //         });
// //         setShowConfirmDialog(false);
// //       } else {
// //         setDeleteErrorMessage(response.data.message || 'Failed to delete file');
// //         toast.error('Error', { description: response.data.message || 'Failed to delete file' });
// //       }
// //     } catch (error) {
// //       const message = axios.isAxiosError(error)
// //         ? error.response?.data?.message || error.message
// //         : 'Failed to delete file';
// //       console.error('Error deleting file:', message);
// //       setDeleteErrorMessage(message);
// //       toast.error('Error', { description: message });
// //     } finally {
// //       setIsDeleting(false);
// //     }
// //   };

// //   const confirmDelete = (index: number) => {
// //     setCurrentIndex(index);
// //     setShowConfirmDialog(true);
// //     setDeleteErrorMessage('');
// //   };

// //   const handleClearForm = () => {
// //     setDeviceName(deviceNames[0]?.deviceName || '');
// //     setDeviceId(deviceNames[0]?.deviceId || '');
// //     setStartDate(undefined);
// //     setEndDate(undefined);
// //     setDeviceData([]);
// //     setDownloadUrl('');
// //     setRecordCount(null);
// //     setError('');
// //   };

// //   return {
// //     deviceName,
// //     setDeviceName,
// //     deviceId,
// //     setDeviceId,
// //     startDate,
// //     setStartDate,
// //     endDate,
// //     setEndDate,
// //     deviceData,
// //     deviceNames,
// //     loading,
// //     downloadUrl,
// //     error,
// //     downloadHistory,
// //     generatingReport,
// //     handleGenerateReport,
// //     handleDownloadClick,
// //     handleDeleteHistory,
// //     handleClearForm,
// //     isMounted,
// //     handlePermanentDelete,
// //     confirmDelete,
// //     isDeleting,
// //     currentIndex,
// //     showConfirmDialog,
// //     setShowConfirmDialog,
// //     deleteErrorMessage,
// //     showExpiredDialog,
// //     setShowExpiredDialog,
// //   };
// // }





// "use client";
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'sonner';

// interface DeviceData {
//   id: string;
//   name: string;
//   temperatureValue?: string;
//   humidityValue?: string;
//   date: string;
//   deviceId: string;
//   isActive?: boolean;
// }

// interface ReportResponse {
//   success: boolean;
//   message: string;
//   data: {
//     downloadUrl: string;
//     expiresIn: number;
//     recordCount: number;
//   };
// }

// interface DownloadHistory {
//   filename: string;
//   downloadUrl: string;
//   createdAt: string;
//   recordCount: number;
// }

// interface Device {
//   deviceId: string;
//   deviceName: string;
// }

// export function useDeviceReports(userEmail: string) {
//   const [deviceName, setDeviceName] = useState<string>('');
//   const [deviceId, setDeviceId] = useState<string>('');
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined);
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined);
//   const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
//   const [deviceNames, setDeviceNames] = useState<Device[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [downloadUrl, setDownloadUrl] = useState('');
//   const [recordCount, setRecordCount] = useState<number | null>(null);
//   const [error, setError] = useState('');
//   const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
//   const [generatingReport, setGeneratingReport] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState<number | null>(null);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
//   const [showExpiredDialog, setShowExpiredDialog] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//     if (typeof window !== 'undefined') {
//       const storedHistory = localStorage.getItem(`downloadHistory_${userEmail}`);
//       if (storedHistory) {
//         setDownloadHistory(JSON.parse(storedHistory));
//       }
//     }
//   }, [userEmail]);

//   useEffect(() => {
//     if (isMounted && downloadHistory.length > 0) {
//       localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(downloadHistory));
//     }
//   }, [downloadHistory, isMounted, userEmail]);

//   useEffect(() => {
//     const fetchDeviceNames = async () => {
//       try {
//         console.log('Fetching user device list for email:', userEmail);
//         const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-device-list`, {
//           params: { email: userEmail },
//         });
//         if (response.data.success) {
//           const devices = (response.data.data || []).map((device: Device) => ({
//             deviceId: device.deviceId?.trim(),
//             deviceName: device.deviceName?.trim(),
//           })).filter((device: Device) => device.deviceId && device.deviceName); // Filter out invalid devices
//           if (devices.length === 0) {
//             console.warn('No valid devices found for user:', userEmail);
//             setError('No devices found for your account');
//             toast.error('Error', { description: 'No devices found for your account' });
//             setDeviceNames([]);
//             setDeviceName('');
//             setDeviceId('');
//           } else {
//             setDeviceNames(devices);
//             if (!deviceName || !devices.some((d: Device) => d.deviceName === deviceName)) {
//               const firstDevice = devices[0];
//               setDeviceName(firstDevice.deviceName);
//               setDeviceId(firstDevice.deviceId);
//               console.log('Selected first device:', firstDevice);
//             }
//           }
//         } else {
//           setError(response.data.message || 'Failed to fetch user devices');
//           setDeviceNames([]);
//           toast.error('Error', { description: response.data.message || 'Failed to fetch user devices' });
//         }
//       } catch (error) {
//         const message = axios.isAxiosError(error)
//           ? error.response?.data?.message || error.message
//           : 'Failed to fetch user devices';
//         console.error('Error fetching device list:', message);
//         setError(message);
//         setDeviceNames([]);
//         setDeviceName('');
//         setDeviceId('');
//         toast.error('Error', { description: message });
//       }
//     };
//     if (isMounted && userEmail) {
//       fetchDeviceNames();
//     }
//   }, [isMounted, userEmail]);

//   useEffect(() => {
//     if (isMounted && deviceId && startDate && endDate && userEmail) {
//       fetchDeviceData();
//     }
//   }, [isMounted, deviceId, startDate, endDate, userEmail]);

//   const fetchDeviceData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       console.log('Fetching device data with params:', {
//         deviceId,
//         deviceName,
//         startDate: startDate?.toISOString(),
//         endDate: endDate?.toISOString(),
//         email: userEmail,
//       });
//       const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/readings`, {
//         params: {
//           deviceId,
//           startDate: startDate?.toISOString(),
//           endDate: endDate?.toISOString(),
//           email: userEmail,
//         },
//       });
//       console.log('Backend response:', response.data);
//       if (response.data.success) {
//         const transformedData = (response.data.data.readings || []).map((item: any) => {
//           const flatReadings = Object.fromEntries(
//             Object.entries(item.readings || {}).map(([k, v]) => [k.toLowerCase() + 'Value', v])
//           );
//           return {
//             ...item,
//             ...flatReadings,
//             name: deviceName, // Use the selected deviceName from state
//           };
//         });
//         setDeviceData(transformedData);
//         if (transformedData.length === 0) {
//           setError(`No data found for device "${deviceName}" in the selected date range`);
//           toast.info('No Data', { description: `No data found for device "${deviceName}" in the selected date range` });
//         }
//       } else {
//         let errorMessage = response.data.message;
//         if (errorMessage === '["deviceId must be a string"]') {
//           errorMessage = 'Invalid device ID format in the database. Please contact support.';
//         } else if (errorMessage.includes('not found for the user') || errorMessage.includes('not associated with user')) {
//           errorMessage = `Device "${deviceName}" is not available for your account. Please select a different device.`;
//         }
//         setError(errorMessage);
//         setDeviceData([]);
//         toast.error('Error', { description: errorMessage });
//       }
//     } catch (error) {
//       let message = 'Failed to fetch device data';
//       if (axios.isAxiosError(error)) {
//         message = error.response?.data?.message || error.message;
//         if (message === '["deviceId must be a string"]') {
//           message = 'Invalid device ID format in the database. Please contact support.';
//         } else if (message.includes('not found for the user') || message.includes('not associated with user')) {
//           message = `Device "${deviceName}" is not available for your account. Please select a different device.`;
//         }
//       }
//       console.error('Error fetching device data:', message);
//       setError(message);
//       setDeviceData([]);
//       toast.error('Error', { description: message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerateReport = async () => {
//     setGeneratingReport(true);
//     setError('');
//     try {
//       console.log('Generating report with params:', {
//         deviceId,
//         deviceName,
//         startDate: startDate?.toISOString(),
//         endDate: endDate?.toISOString(),
//         email: userEmail,
//       });
//       const response = await axios.post<ReportResponse>(
//         `${process.env.NEXT_PUBLIC_API_URL}/analytics/export`,
//         null,
//         {
//           params: {
//             deviceId,
//             startDate: startDate?.toISOString(),
//             endDate: endDate?.toISOString(),
//             email: userEmail,
//           },
//         }
//       );
//       if (response.data.success) {
//         setDownloadUrl(response.data.data.downloadUrl);
//         setRecordCount(response.data.data.recordCount);
//         toast.success('Report generated', {
//           description: 'Your report has been generated successfully.',
//         });
//       } else {
//         setError(response.data.message || 'Failed to generate report');
//         toast.error('Error', { description: response.data.message || 'Failed to generate report' });
//       }
//     } catch (error) {
//       const message = axios.isAxiosError(error)
//         ? error.response?.data?.message || error.message
//         : 'Failed to generate report';
//       console.error('Error generating report:', message);
//       setError(message);
//       toast.error('Error', { description: message });
//     } finally {
//       setGeneratingReport(false);
//     }
//   };

//   const isUrlExpired = (createdAt: string): boolean => {
//     try {
//       const createdDate = new Date(createdAt);
//       if (isNaN(createdDate.getTime())) return true;
//       const now = new Date();
//       const expiresInSeconds = 1800;
//       const timeDiffSeconds = (now.getTime() - createdDate.getTime()) / 1000;
//       return timeDiffSeconds > expiresInSeconds;
//     } catch {
//       return true;
//     }
//   };

//   const handleDownloadClick = (downloadUrl: string, createdAt: string): void => {
//     if (isUrlExpired(createdAt)) {
//       setShowExpiredDialog(true);
//       return;
//     }
//     if (downloadUrl && recordCount !== null) {
//       const newHistoryItem: DownloadHistory = {
//         filename: `device-report-${deviceName}-${new Date().toISOString().split('T')[0]}.xlsx`,
//         downloadUrl,
//         createdAt: new Date().toISOString(),
//         recordCount,
//       };
//       setDownloadHistory((prev) => [newHistoryItem, ...prev].slice(0, 10));
//       setTimeout(() => {
//         setDownloadUrl('');
//         setRecordCount(null);
//       }, 1000);
//     }
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = '';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDeleteHistory = (index: number) => {
//     setDownloadHistory((prev) => {
//       const updatedHistory = prev.filter((_, i) => i !== index);
//       if (updatedHistory.length === 0) {
//         localStorage.removeItem(`downloadHistory_${userEmail}`);
//       } else {
//         localStorage.setItem(`downloadHistory_${userEmail}`, JSON.stringify(updatedHistory));
//       }
//       return updatedHistory;
//     });
//   };

//   const extractS3KeyFromUrl = (url: string): string => {
//     try {
//       const urlObj = new URL(url);
//       const pathParts = urlObj.pathname.split('/');
//       const analyticsIndex = pathParts.findIndex((part) => part === 'analytics');
//       if (analyticsIndex >= 0) {
//         return pathParts.slice(analyticsIndex).join('/');
//       }
//       return `analytics/${pathParts[pathParts.length - 1]}`;
//     } catch (error) {
//       console.error('Error extracting S3 key:', error);
//       const parts = url.split('/');
//       const filename = parts[parts.length - 1].split('?')[0];
//       return `analytics/${filename}`;
//     }
//   };

//   const handlePermanentDelete = async (index: number) => {
//     setCurrentIndex(index);
//     setIsDeleting(true);
//     setDeleteErrorMessage('');
//     try {
//       const item = downloadHistory[index];
//       const s3Key = extractS3KeyFromUrl(item.downloadUrl);
//       const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/analytics/files`, {
//         params: { key: s3Key },
//       });
//       if (response.data.success) {
//         handleDeleteHistory(index);
//         toast.success('File deleted', {
//           description: 'The file has been permanently deleted',
//         });
//         setShowConfirmDialog(false);
//       } else {
//         setDeleteErrorMessage(response.data.message || 'Failed to delete file');
//         toast.error('Error', { description: response.data.message || 'Failed to delete file' });
//       }
//     } catch (error) {
//       const message = axios.isAxiosError(error)
//         ? error.response?.data?.message || error.message
//         : 'Failed to delete file';
//       console.error('Error deleting file:', message);
//       setDeleteErrorMessage(message);
//       toast.error('Error', { description: message });
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const confirmDelete = (index: number) => {
//     setCurrentIndex(index);
//     setShowConfirmDialog(true);
//     setDeleteErrorMessage('');
//   };

//   const handleClearForm = () => {
//     setDeviceName(deviceNames[0]?.deviceName || '');
//     setDeviceId(deviceNames[0]?.deviceId || '');
//     setStartDate(undefined);
//     setEndDate(undefined);
//     setDeviceData([]);
//     setDownloadUrl('');
//     setRecordCount(null);
//     setError('');
//   };

//   return {
//     deviceName,
//     setDeviceName,
//     deviceId,
//     setDeviceId,
//     startDate,
//     setStartDate,
//     endDate,
//     setEndDate,
//     deviceData,
//     deviceNames,
//     loading,
//     downloadUrl,
//     error,
//     downloadHistory,
//     generatingReport,
//     handleGenerateReport,
//     handleDownloadClick,
//     handleDeleteHistory,
//     handleClearForm,
//     isMounted,
//     handlePermanentDelete,
//     confirmDelete,
//     isDeleting,
//     currentIndex,
//     showConfirmDialog,
//     setShowConfirmDialog,
//     deleteErrorMessage,
//     showExpiredDialog,
//     setShowExpiredDialog,
//   };
// }










>>>>>>> Stashed changes
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // For Next.js navigation

interface DeviceData {
  id: string;
  name: string;
  temperatureValue?: string;
  humidityValue?: string;
  date: string;
  deviceId: string;
}
interface ReportResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    expiresIn: number;
    recordCount: number;
    s3Key: string;
  };
}
interface DownloadHistory {
  id: string;
  filename: string;
  downloadUrl: string;
  createdAt: string;
  recordCount: number;
  s3Key: string;
}
interface Device {
  deviceId: string;
  deviceName: string;
}

export function useDeviceReports(userEmail: string | undefined) {
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
  const [isEmailLoading, setIsEmailLoading] = useState(true); // New state to track email loading
  const router = useRouter(); // For redirecting to login

  // Check for userEmail availability on mount
  useEffect(() => {
    if (userEmail === undefined) {
      // Simulate async email fetch (replace with actual auth logic)
      setIsEmailLoading(true);
      // Example: Fetch email from auth context or API
      // const fetchEmail = async () => {
      //   try {
      //     const response = await axios.get('/api/auth/user');
      //     return response.data.email;
      //   } catch {
      //     return null;
      //   }
      // };
      // fetchEmail().then((email) => {
      //   if (!email) {
      //     setError('User email is required');
      //     toast.error('Error', { description: 'Please log in to continue' });
      //     router.push('/login');
      //   }
      //   setIsEmailLoading(false);
      // });
      
      // For now, assume email is undefined initially
      setTimeout(() => {
        if (!userEmail) {
          setError('User email is required');
          toast.error('Error', { description: 'Please log in to continue' });
          router.push('/login'); // Redirect to login page
        }
        setIsEmailLoading(false);
      }, 100); // Small delay to allow auth context to initialize
    } else {
      setIsEmailLoading(false);
      setIsMounted(true);
    }
  }, [userEmail, router]);

  // Fetch download history when email is available
  useEffect(() => {
    if (isMounted && userEmail && !isEmailLoading) {
      fetchDownloadHistory();
    }
  }, [isMounted, userEmail, isEmailLoading]);

  const fetchDownloadHistory = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/download-history`, {
        params: { email: userEmail },
      });
      if (response.data.success) {
        setDownloadHistory(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch download history');
        toast.error('Error', { description: response.data.message || 'Failed to fetch download history' });
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to fetch download history';
      setError(message);
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  };

  // Fetch device names when email is available
  useEffect(() => {
    const fetchDeviceNames = async () => {
      if (!userEmail) return;
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/user-device-list`, {
          params: { email: userEmail },
        });
        if (response.data.success) {
          const devices = (response.data.data || []).map((device: Device) => ({
            deviceId: device.deviceId?.trim(),
            deviceName: device.deviceName?.trim(),
          })).filter((device: Device) => device.deviceId && device.deviceName);
          if (devices.length === 0) {
            setError('No devices found for your account');
            toast.error('Error', { description: 'No devices found for your account' });
            setDeviceNames([]);
            setDeviceName('');
            setDeviceId('');
          } else {
            setDeviceNames(devices);
            if (!deviceName || !devices.some((d: Device) => d.deviceName === deviceName)) {
              const firstDevice = devices[0];
              setDeviceName(firstDevice.deviceName);
              setDeviceId(firstDevice.deviceId);
            }
          }
        } else {
          setError(response.data.message || 'Failed to fetch user devices');
          setDeviceNames([]);
          toast.error('Error', { description: response.data.message || 'Failed to fetch user devices' });
        }
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message或是error.message
          : 'Failed to fetch user devices';
        setError(message);
        setDeviceNames([]);
        setDeviceName('');
        setDeviceId('');
        toast.error('Error', { description: message });
      } finally {
        setLoading(false);
      }
    };
    if (isMounted && userEmail && !isEmailLoading) {
      fetchDeviceNames();
    }
  }, [isMounted, userEmail, isEmailLoading]);

  // Fetch device data when dependencies are met
  useEffect(() => {
    if (isMounted && deviceId && startDate && endDate && userEmail && !isEmailLoading) {
      fetchDeviceData();
    }
  }, [isMounted, deviceId, startDate, endDate, userEmail, isEmailLoading]);

  const fetchDeviceData = async () => {
    if (!userEmail) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/readings`, {
        params: {
          deviceId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          email: userEmail,
        },
      });
      if (response.data.success) {
<<<<<<< Updated upstream
        const transformedData = (response.data.data.readings || []).map((item: any) => ({
          ...item,
          temperatureValue: item.temperatureValue != null ? String(item.temperatureValue) : undefined,
          humidityValue: item.humidityValue != null ? String(item.humidityValue) : undefined,
          name: deviceName, // Use the selected deviceName from state
        }));
=======
        const transformedData = (response.data.data.readings || []).map((item: any) => {
          const flatReadings = Object.fromEntries(
            Object.entries(item.readings || {}).map(([k, v]) => [k.toLowerCase() + 'Value', v])
          );
          return {
            ...item,
            ...flatReadings,
            name: deviceName,
          };
        });
>>>>>>> Stashed changes
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
        } else if (message.includes('not found for the user') || error.message.includes('not associated with user')) {
          message = `Device "${deviceName}" is not available for your account. Please select a different device.`;
        }
      }
      setError(message);
      setDeviceData([]);
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!userEmail) {
      setError('User email is required');
      toast.error('Error', { description: 'Please log in to continue' });
      router.push('/login');
      return;
    }
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

        const historyResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/download-history`,
          {
            userEmail,
            filename: `device-report-${deviceName}-${new Date().toISOString().split('T')[0]}.xlsx`,
            downloadUrl: response.data.data.downloadUrl,
            recordCount: response.data.data.recordCount,
            s3Key: response.data.data.s3Key,
          }
        );
        if (historyResponse.data.success) {
          setDownloadHistory((prev) => [historyResponse.data.data, ...prev].slice(0, 10));
        }

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

  const handleDeleteHistory = async (index: number) => {
    setCurrentIndex(index);
    setShowConfirmDialog(true);
  };

  const handlePermanentDelete = async (index: number) => {
    if (!userEmail) {
      setDeleteErrorMessage('User email is required');
      toast.error('Error', { description: 'Please log in to continue' });
      router.push('/login');
      return;
    }
    setIsDeleting(true);
    setDeleteErrorMessage('');
    try {
      const item = downloadHistory[index];
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/analytics/download-history/${item.id}`, {
        params: { email: userEmail },
      });
      if (response.data.success) {
        setDownloadHistory((prev) => prev.filter((_, i) => i !== index));
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
      setDeleteErrorMessage(message);
      toast.error('Error', { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadClick = (downloadUrl: string, createdAt: string): void => {
    if (isUrlExpired(createdAt)) {
      setShowExpiredDialog(true);
      return;
    }
    if (!downloadUrl) {
      toast.error('Error', { description: 'Invalid download URL' });
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      link.onerror = () => {
        toast.error('Error', { description: 'Failed to download the file. Please try again.' });
      };
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Error', { description: 'An unexpected error occurred while downloading.' });
    }
  };

  const handleClearForm = () => {
    setDeviceName(deviceNames[0]?.deviceName || '');
    setDeviceId(deviceNames[0]?.deviceId || '');
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
    confirmDelete: (index: number) => {
      setCurrentIndex(index);
      setShowConfirmDialog(true);
      setDeleteErrorMessage('');
    },
    isDeleting,
    currentIndex,
    showConfirmDialog,
    setShowConfirmDialog,
    deleteErrorMessage,
    showExpiredDialog,
    setShowExpiredDialog,
    isEmailLoading,
  };
}