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
  deviceId: string;
}

interface DeviceDataTableProps {
  data: DeviceData[];
  loading: boolean;
  error: string;
  deviceName: string;
}

export function DeviceDataTable({
  data,
  loading,
  error,
  deviceName,
}: DeviceDataTableProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const displayDeviceName = deviceName || (data.length > 0 ? data[0].name || "Unknown Device" : "No Data");

  return (
    <div className="rounded-md border">
      <h2 className="text-2xl font-bold text-center mb-4">
        Device: {displayDeviceName}
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