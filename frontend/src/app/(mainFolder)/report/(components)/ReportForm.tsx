import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const DatePicker = dynamic(
  () =>
    import("react-datepicker").then(
      (mod) => mod.default as React.ComponentType<any>
    ),
  { ssr: false }
);

import "react-datepicker/dist/react-datepicker.css";

interface ReportFormProps {
  deviceName: string;
  setDeviceName: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  deviceNames: string[];
  onClear: () => void;
}

export function ReportForm({
  deviceName,
  setDeviceName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  deviceNames,
  onClear,
}: ReportFormProps) {
  return (
    <div className="flex flex-row flex-nowrap gap-2 md:gap-4 mb-4 items-center max-w-[90vw] overflow-x-auto">
      {/* Device selection dropdown */}
      <div className="min-w-[120px] max-w-[180px]">
        <label className="block font-bold text-xs md:text-sm mb-1 px-2 md:px-4">
          Select Device
        </label>
        <Select value={deviceName} onValueChange={setDeviceName}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Select Device" />
          </SelectTrigger>
          <SelectContent>
            {deviceNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date range pickers */}
      <div className="min-w-[180px] max-w-[300px]">
        <label className="block font-bold text-xs md:text-sm mb-1 px-2 md:px-4">
          Select Date Range
        </label>
        <div className="flex flex-row gap-2">
          <div className="w-1/2 min-w-[80px]">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date || undefined)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              customInput={<Input placeholder="Start Date" className="w-full h-10" />}
              className="w-full"
            />
          </div>
          <div className="w-1/2 min-w-[80px]">
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date || undefined)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              placeholderText="End Date"
              customInput={<Input placeholder="End Date" className="w-full h-10" />}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Clear form button */}
      <div className="min-w-[100px] max-w-[150px] ml-auto">
        <label className="block font-bold text-xs md:text-sm mb-1 px-2 md:px-4 invisible">
          Clear
        </label>
        <Button
          variant="outline"
          onClick={onClear}
          className="w-auto h-10 px-4 text-xs md:text-sm"
        >
          Clear Form
        </Button>
      </div>
    </div>
  );
}