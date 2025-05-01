"use client";
import Link from "next/link";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data: Device[] = [
  {
    id: "d1",
    deviceName: "Temperature Sensor 1",
    type: "Sensor",
    status: "Active",
  },
  {
    id: "d2",
    deviceName: "Pressure Sensor A",
    type: "Sensor",
    status: "Active",
  },
  {
    id: "d3",
    deviceName: "Humidity Monitor",
    type: "Sensor",
    status: "Inactive",
  },
  {
    id: "d4",
    deviceName: "Smart Camera 1",
    type: "Camera",
    status: "Active",
  },
  {
    id: "d5",
    deviceName: "Motion Detector",
    type: "Sensor",
    status: "Active",
  },
  {
    id: "d6",
    deviceName: "Light Controller",
    type: "Actuator",
    status: "Inactive",
  },
  {
    id: "d7",
    deviceName: "Air Quality Monitor",
    type: "Sensor",
    status: "Active",
  },
  {
    id: "d8",
    deviceName: "Smart Lock",
    type: "Actuator",
    status: "Active",
  },
  {
    id: "d9",
    deviceName: "Water Leak Detector",
    type: "Sensor",
    status: "Inactive",
  },
  {
    id: "d10",
    deviceName: "Thermostat",
    type: "Actuator",
    status: "Active",
  },
  {
    id: "d11",
    deviceName: "Security Camera",
    type: "Camera",
    status: "Active",
  },
  {
    id: "d12",
    deviceName: "Vibration Sensor",
    type: "Sensor",
    status: "Inactive",
  },
  {
    id: "d13",
    deviceName: "Smart Plug",
    type: "Actuator",
    status: "Active",
  },
  {
    id: "d14",
    deviceName: "CO2 Monitor",
    type: "Sensor",
    status: "Active",
  },
  {
    id: "d15",
    deviceName: "Door/Window Sensor",
    type: "Sensor",
    status: "Inactive",
  },
];

export type Device = {
  id: string;
  deviceName: string;
  type: string;
  status: "Active" | "Inactive";
};

export const columns: ColumnDef<Device>[] = [
  {
    accessorKey: "deviceName",
    header: "Device Name",
    cell: ({ row }) => (
      <Link
        href={`/devices/${row.original.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {row.getValue("deviceName")}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status.toLowerCase() === "active";
      return (
        <div className="flex justify-center items-center gap-2 text-center">
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {status}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      return row.getValue(id) === value;
    },
  },
];

export function DeviceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  // Get unique types for filter dropdown
  const deviceTypes = Array.from(new Set(data.map((device) => device.type)));
  const statusOptions = ["Active", "Inactive"];

  return (
    <div className="w-full p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
        {/* Device Name Filter */}
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Filter by device name"
            value={
              (table.getColumn("deviceName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("deviceName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-white"
          />
        </div>

        {/* Device Type Filter */}
        <div className="w-full sm:w-auto">
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("type")?.setFilterValue("");
              } else {
                table.getColumn("type")?.setFilterValue(value);
              }
            }}
            value={
              (table.getColumn("type")?.getFilterValue() as string) || "all"
            }
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {deviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <Select
            onValueChange={(value) => {
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : value);
            }}
            value={
              (table.getColumn("status")?.getFilterValue() as string) || "all"
            }
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Columns Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-white">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="rounded-md border bg-white w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-center p-2 w-1/4 hover:bg-transparent hover:text-inherit"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-100">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-center p-2 w-1/4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No devices found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} devices
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-black"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-black"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
