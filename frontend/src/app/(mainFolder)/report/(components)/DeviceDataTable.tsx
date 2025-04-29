import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface DeviceData {
  id: string;
  name: string;
  temperatureValue?: string;
  humidityValue?: string;
  date: string;
  location?: string;
}

interface DeviceDataTableProps {
  data: DeviceData[];
  loading: boolean;
  error: string;
}

export function DeviceDataTable({
  data,
  loading,
  error,
}: DeviceDataTableProps) {
  // Display error message if present
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show loading spinner during data fetch
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Extract device name and location from the first data item, with fallbacks
  const deviceName = data.length > 0 ? data[0].name || "Unknown Device" : "No Data";
  const location = data.length > 0 ? data[0].location || "Unknown Location" : "Unknown Location";

  // Render heading and data table
  return (
    <div className="rounded-md border">
      {/* Heading with device name and location */}
      <h2 className="text-2xl font-bold text-center mb-4">
        Device: {deviceName} ({location})
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Temperature Value</TableHead>
            <TableHead>Humidity Value</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.temperatureValue || "-"}</TableCell>
              <TableCell>{item.humidityValue || "-"}</TableCell>
              <TableCell>
                {item.date ? new Date(item.date).toLocaleString() : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}