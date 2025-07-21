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
  [key: string]: any;
}

interface DeviceDataTableProps {
  data: DeviceData[];
  loading: boolean;
  error: string;
  deviceName: string;
  fields?: string[]; // dynamic fields
}

export function DeviceDataTable({
  data,
  loading,
  error,
  deviceName,
  fields,
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

  // Use provided fields or fallback to default
  const displayFields = fields && fields.length > 0 ? fields : ["temperatureValue", "humidityValue"];
  // Always include date as the last column
  const allFields = [...displayFields, "date"];

  // Helper to make headers pretty
  const getHeader = (field: string) => {
    if (field === "date") return "Date";
    if (field === "deviceId") return "Device ID";
    // Remove trailing 'Value' and capitalize
    return (
      field.replace(/Value$/, "").charAt(0).toUpperCase() +
      field.replace(/Value$/, "").slice(1) +
      (field.endsWith("Value") ? " Value" : "")
    );
  };

  return (
    <div className="rounded-md border">
      <h2 className="text-2xl font-bold text-center mb-4">
        Device: {displayDeviceName}
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            {allFields.map((field) => (
              <TableHead key={field}>{getHeader(field)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {allFields.map((field) => (
                <TableCell key={field}>
                  {field === "date"
                    ? item.date
                      ? new Date(item.date).toLocaleString()
                      : "-"
                    : item[field] !== undefined && item[field] !== null
                    ? item[field]
                    : "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}