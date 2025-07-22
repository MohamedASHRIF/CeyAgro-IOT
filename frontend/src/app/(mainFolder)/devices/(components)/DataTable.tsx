
// "use client";
// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { ChevronDown } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export type Device = {
//   id: string;
//   deviceName: string;
//   status: "Active" | "Inactive";
// };

// export const columns: ColumnDef<Device>[] = [
//   {
//     accessorKey: "id",
//     header: "Device ID",
//     cell: ({ row }) => (
//       <Link
//         href={`/devices/${row.original.id}`}
//         // target="_blank"
//         rel="noopener noreferrer"
//         className="hover:underline text-black hover:text-[hsl(172.5,_66%,_50.4%)] font-medium"
//       >
//         {row.getValue("id")}
//       </Link>
//     ),
//   },
//   {
//     accessorKey: "deviceName",
//     header: "Device Name",
//     cell: ({ row }) => <div>{row.getValue("deviceName")}</div>,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status") as string;
//       const isActive = status.toLowerCase() === "active";
//       return (
//         <div className="flex justify-center items-center gap-2 text-center">
//           <span className="flex items-center gap-2">
//             <span
//               className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"
//                 }`}
//             />
//             {status}
//           </span>
//         </div>
//       );
//     },
//     filterFn: (row, id, value) => {
//       if (!value || value.length === 0) return true;
//       return row.getValue(id) === value;
//     },
//   },
// ];
 

// export function DeviceTable({ userEmail }: { userEmail: string }) {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   useEffect(() => {
//     if (!userEmail) return;

//     setLoading(true);
//     fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/devices?email=${encodeURIComponent(userEmail)}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success && Array.isArray(data.data)) {
//           const formattedDevices = data.data.map((d: any) => {
//             const id = d.userDevice?.deviceId ?? "N/A";
//             const deviceName = d.userDevice?.deviceName ?? "Unknown";
//             const isActive = d.deviceData?.isActive ?? false;

//             return {
//               id,
//               deviceName,
//               status: isActive ? "Active" : "Inactive",
//             };
//           });
//           setDevices(formattedDevices);
//         } else {
//           setDevices([]);
//           console.error("No devices found or bad response format", data);
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to fetch devices:", err);
//         setDevices([]);
//       })
//       .finally(() => setLoading(false));
//   }, [userEmail]);

//   const table = useReactTable({
//     data: devices,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       pagination,
//     },
//     onPaginationChange: setPagination,
//   });

//   if (loading) return (
//     <div
//       className="flex items-center justify-center h-screen"
//       role="status"
//       aria-label="Loading"
//     >
//       <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
//       <span className="sr-only">Loading...</span>
//     </div>
//   );
//   ;

//   return (
//     <div className="w-full p-4">
//       <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
//         <Input
//           placeholder="Filter by device ID"
//           value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
//           onChange={(e) => table.getColumn("id")?.setFilterValue(e.target.value)}
//           className="max-w-sm bg-white"
//         />
//         <Input
//           placeholder="Filter by device name"
//           value={(table.getColumn("deviceName")?.getFilterValue() as string) ?? ""}
//           onChange={(e) => table.getColumn("deviceName")?.setFilterValue(e.target.value)}
//           className="max-w-sm bg-white"
//         />
//         <Select
//           onValueChange={(value) => {
//             table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
//           }}
//           value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
//         >
//           <SelectTrigger className="w-[180px] bg-white">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="Active">Active</SelectItem>
//             <SelectItem value="Inactive">Inactive</SelectItem>
//           </SelectContent>
//         </Select>

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="outline" className="ml-auto bg-white">
//               Columns <ChevronDown className="ml-2 h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             {table
//               .getAllColumns()
//               .filter((column) => column.getCanHide())
//               .map((column) => (
//                 <DropdownMenuCheckboxItem
//                   key={column.id}
//                   className="capitalize"
//                   checked={column.getIsVisible()}
//                   onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                 >
//                   {column.id}
//                 </DropdownMenuCheckboxItem>
//               ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       <div className="max-w-full overflow-x-auto">
//         <div className="rounded-md border bg-white w-full">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableHead
//                       key={header.id}
//                       className="text-center p-2 w-1/3 hover:bg-transparent hover:text-inherit"
//                     >
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(header.column.columnDef.header, header.getContext())}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.id} className="hover:bg-gray-100">
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id} className="text-center p-2 w-1/3">
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} className="h-24 text-center">
//                     No devices found matching your filters.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       <div className="flex items-center justify-between space-x-2 py-4">
//         <div className="text-sm text-muted-foreground">
//           Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} devices
//         </div>
//         <div className="space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="text-black"
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="text-black"
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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

export type Device = {
  id: string;
  deviceName: string;
  status: "Active" | "Inactive";
};

export const columns: ColumnDef<Device>[] = [
  {
    accessorKey: "id",
    header: "Device ID",
    cell: ({ row }) => (
      <Link
        href={`/devices/${row.original.id}`}
        // target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-black hover:text-[hsl(172.5,_66%,_50.4%)] font-medium"
      >
        {row.getValue("id")}
      </Link>
    ),
  },
  {
    accessorKey: "deviceName",
    header: "Device Name",
    cell: ({ row }) => <div>{row.getValue("deviceName")}</div>,
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
              className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"
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
 //const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function DeviceTable({ userEmail }: { userEmail: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    if (!userEmail) return;

    setLoading(true);
 fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/device-user/devices?email=${encodeURIComponent(userEmail)}`)      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedDevices = data.data.map((d: any) => {
            const id = d.userDevice?.deviceId ?? "N/A";
            const deviceName = d.userDevice?.deviceName ?? "Unknown";
            const isActive = d.deviceData?.isActive ?? false;

            return {
              id,
              deviceName,
              status: isActive ? "Active" : "Inactive",
            };
          });
          setDevices(formattedDevices);
        } else {
          setDevices([]);
          console.error("No devices found or bad response format", data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch devices:", err);
        setDevices([]);
      })
      .finally(() => setLoading(false));
  }, [userEmail]);

  const table = useReactTable({
    data: devices,
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

  if (loading) return (
    <div
      className="flex items-center justify-center h-screen"
      role="status"
      aria-label="Loading"
    >
      <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  );
  ;

  return (
    <div className="w-full p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
        <Input
          placeholder="Filter by device ID"
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("id")?.setFilterValue(e.target.value)}
          className="max-w-sm bg-white"
        />
        <Input
          placeholder="Filter by device name"
          value={(table.getColumn("deviceName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("deviceName")?.setFilterValue(e.target.value)}
          className="max-w-sm bg-white"
        />
        <Select
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
          }}
          value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
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
                      className="text-center p-2 w-1/3 hover:bg-transparent hover:text-inherit"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell key={cell.id} className="text-center p-2 w-1/3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} devices
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












