"use client";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportForm } from "./(components)/ReportForm";
import { DeviceDataTable } from "./(components)/DeviceDataTable";
import { DownloadHistoryTable } from "./(components)/DownloadHistoryTable";
import { useDeviceReports } from "./(components)/useDeviceReports";
import { Loader2 } from "lucide-react";


export default function DeviceReports() {
  const {
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
    confirmDelete, 
    isDeleting, 
    currentIndex, 
    showConfirmDialog, 
    setShowConfirmDialog,
    deleteErrorMessage, 
    handlePermanentDelete,
    showExpiredDialog,
    setShowExpiredDialog,
  } = useDeviceReports();

  if (!isMounted) {
    return null;
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
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            deviceNames={deviceNames}
            onClear={handleClearForm}
          />

          {/* Table displaying device data  */}
          <DeviceDataTable data={deviceData} loading={loading} error={error} />

         {/* Button to generate or download the report */}
         <div className="mt-4 flex justify-center">
            {downloadUrl ? (
              <Button
                onClick={() => handleDownloadClick(downloadUrl, new Date().toISOString())}
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
            onDelete={handleDeleteHistory}
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



