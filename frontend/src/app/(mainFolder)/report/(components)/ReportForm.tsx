import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';

const DatePicker = dynamic(
  () => import('react-datepicker').then((mod) => mod.default as React.ComponentType<any>),
  { ssr: false }
);

import 'react-datepicker/dist/react-datepicker.css';

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
    <div className="flex flex-wrap gap-4 mb-4">
        {/* Device selection dropdown */}
      <div className="min-w-[200px]">
        <Select value={deviceName} onValueChange={setDeviceName}>
          <SelectTrigger>
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
      <div className="flex flex-wrap gap-4">
        <div className="datepicker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date || undefined)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            customInput={<Input placeholder="Start Date" />}
            className="w-full"
          />
        </div>
        <div className="datepicker-wrapper">
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date || undefined)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ?? undefined}
            placeholderText="End Date"
            customInput={<Input placeholder="End Date" />}
            className="w-full"
          />
        </div>
      </div>

{/* Clear form button */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onClear}>
          Clear Form
        </Button>
      </div>
    </div>
  );
}