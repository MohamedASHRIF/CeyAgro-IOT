// "use client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ReportForm } from "./(components)/ReportForm";
// import { DeviceDataTable } from "./(components)/DeviceDataTable";
// import { DownloadHistoryTable } from "./(components)/DownloadHistoryTable";
// import { useDeviceReports } from "./(components)/useDeviceReports";
// import { Loader2 } from "lucide-react";
// import { useUser } from "@auth0/nextjs-auth0/client";
// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function DeviceReports() {
//   const { user, isLoading } = useUser();
//   const userEmail = user?.email || "";
//   const [fields, setFields] = useState<string[]>([]); // dynamic fields for table
//   const {
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
//     confirmDelete,
//     isDeleting,
//     currentIndex,
//     showConfirmDialog,
//     setShowConfirmDialog,
//     deleteErrorMessage,
//     handlePermanentDelete,
//     showExpiredDialog,
//     setShowExpiredDialog,
//   } = useDeviceReports(userEmail);

//   // Fetch device types for the selected device
//   useEffect(() => {
//     if (!deviceId || !userEmail) {
//       setFields([]);
//       return;
//     }
//     axios
//       .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/device-types`, {
//         params: { deviceId, email: userEmail },
//       })
//       .then((response) => {
//         if (response.data.success && Array.isArray(response.data.data)) {
//           const types = response.data.data.map((t: any) => {
//             const key = t.type.charAt(0).toLowerCase() + t.type.slice(1);
//             return key.endsWith('Value') ? key : key + 'Value';
//           });
//           setFields(types);
//         } else {
//           setFields([]);
//         }
//       })
//       .catch(() => setFields([]));
//   }, [deviceId, userEmail]);

//   if (!isMounted || isLoading) {
//     return (
//       <div className="flex justify-center py-4">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-5 container py-8 mx-auto">
//       <h1 className="mb-6 text-3xl font-bold text-center">Device Report</h1>

//       <Card className="mb-8">
//         <CardContent className="pt-6">
//           {/* Form for selecting device and date range */}
//           <ReportForm
//             deviceName={deviceName}
//             setDeviceName={setDeviceName}
//             deviceId={deviceId}
//             setDeviceId={setDeviceId}
//             startDate={startDate}
//             setStartDate={setStartDate}
//             endDate={endDate}
//             setEndDate={setEndDate}
//             deviceNames={deviceNames}
//             onClear={handleClearForm}
//           />

//           {/* Table displaying device data */}
//           <DeviceDataTable
//             data={deviceData}
//             loading={loading}
//             error={error}
//             deviceName={deviceName}
//             fields={fields}
//           />

//           {/* Button to generate or download the report */}
//           <div className="mt-4 flex justify-center">
//             {downloadUrl ? (
//               <Button
//                 onClick={() =>
//                   handleDownloadClick(downloadUrl, new Date().toISOString())
//                 }
//                 className="w-full sm:w-auto"
//               >
//                 Download Report
//               </Button>
//             ) : (
//               <Button
//                 onClick={handleGenerateReport}
//                 disabled={
//                   generatingReport || !deviceName || !startDate || !endDate
//                 }
//                 className="w-full sm:w-auto"
//               >
//                 {generatingReport ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   "Generate Report"
//                 )}
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Download history section and delete selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Download History</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <DownloadHistoryTable
//             history={downloadHistory}
//             onDelete={handleDeleteHistory}
//             confirmDelete={confirmDelete}
//             isDeleting={isDeleting}
//             currentIndex={currentIndex}
//             showConfirmDialog={showConfirmDialog}
//             setShowConfirmDialog={setShowConfirmDialog}
//             deleteErrorMessage={deleteErrorMessage}
//             handlePermanentDelete={handlePermanentDelete}
//             handleDownloadClick={handleDownloadClick}
//             showExpiredDialog={showExpiredDialog}
//             setShowExpiredDialog={setShowExpiredDialog}
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }









"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportForm } from "./(components)/ReportForm";
import { DeviceDataTable } from "./(components)/DeviceDataTable";
import { DownloadHistoryTable } from "./(components)/DownloadHistoryTable";
import { useDeviceReports } from "./(components)/useDeviceReports";
import { Loader2 } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DeviceReports() {
  const { user, isLoading } = useUser();
  const userEmail = user?.email || "";
  const [fields, setFields] = useState<string[]>([]); // dynamic fields for table
  const {
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
    confirmDelete,
    isDeleting,
    currentIndex,
    showConfirmDialog,
    setShowConfirmDialog,
    deleteErrorMessage,
    handlePermanentDelete,
    showExpiredDialog,
    setShowExpiredDialog,
  } = useDeviceReports(userEmail);

  // Fetch device types for the selected device
  useEffect(() => {
    if (!deviceId || !userEmail) {
      setFields([]);
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/analytics/device-types`, {
        params: { deviceId, email: userEmail },
      })
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          const types = response.data.data.map((t: any) => {
            const key = t.type.charAt(0).toLowerCase() + t.type.slice(1);
            return key.endsWith('Value') ? key : key + 'Value';
          });
          setFields(types);
        } else {
          setFields([]);
        }
      })
      .catch(() => setFields([]));
  }, [deviceId, userEmail]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 container py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Device Report</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Form for selecting device and date range */}
          <ReportForm
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            deviceNames={deviceNames}
            onClear={handleClearForm}
          />

          {/* Table displaying device data */}
          <DeviceDataTable
            data={deviceData}
            loading={loading}
            error={error}
            deviceName={deviceName}
            fields={fields}
          />

          {/* Button to generate or download the report */}
          <div className="mt-4 flex justify-center">
            {downloadUrl ? (
              <Button
                onClick={() =>
                  handleDownloadClick(downloadUrl, new Date().toISOString())
                }
                className="w-full sm:w-auto"
              >
                Download Report
              </Button>
            ) : (
              <Button
                onClick={handleGenerateReport}
                disabled={
                  generatingReport || !deviceName || !startDate || !endDate
                }
                className="w-full sm:w-auto"
              >
                {generatingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download history section and delete selection */}
      <Card>
        <CardHeader>
          <CardTitle>Download History</CardTitle>
        </CardHeader>
        <CardContent>
          <DownloadHistoryTable
            history={downloadHistory}
            confirmDelete={confirmDelete}
            isDeleting={isDeleting}
            currentIndex={currentIndex}
            showConfirmDialog={showConfirmDialog}
            setShowConfirmDialog={setShowConfirmDialog}
            deleteErrorMessage={deleteErrorMessage}
            handlePermanentDelete={handlePermanentDelete}
            handleDownloadClick={handleDownloadClick}
            showExpiredDialog={showExpiredDialog}
            setShowExpiredDialog={setShowExpiredDialog}
          />
        </CardContent>
      </Card>
    </div>
  );
}