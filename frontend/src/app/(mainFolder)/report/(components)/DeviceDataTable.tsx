// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2 } from "lucide-react";

// interface DeviceData {
//   id: string;
//   name: string;
//   [key: string]: any;
// }

// interface DeviceDataTableProps {
//   data: DeviceData[];
//   loading: boolean;
//   error: string;
//   deviceName: string;
//   fields?: string[]; // dynamic fields
// }

// export function DeviceDataTable({
//   data,
//   loading,
//   error,
//   deviceName,
//   fields,
// }: DeviceDataTableProps) {
//   if (error) {
//     return (
//       <Alert variant="destructive" className="mb-4">
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center py-4">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     );
//   }

//   const displayDeviceName = deviceName || (data.length > 0 ? data[0].name || "Unknown Device" : "No Data");

//   // Use provided fields or fallback to default
//   const displayFields = fields && fields.length > 0 ? fields : ["temperatureValue", "humidityValue"];
//   // Always include date as the last column
//   const allFields = [...displayFields, "date"];

//   // Helper to make headers pretty
//   const getHeader = (field: string) => {
//     if (field === "date") return "Date";
//     if (field === "deviceId") return "Device ID";
//     // Remove trailing 'Value' and capitalize
//     return (
//       field.replace(/Value$/, "").charAt(0).toUpperCase() +
//       field.replace(/Value$/, "").slice(1) +
//       (field.endsWith("Value") ? " Value" : "")
//     );
//   };

//   return (
//     <div className="rounded-md border">
//       <h2 className="text-2xl font-bold text-center mb-4">
//         Device: {displayDeviceName}
//       </h2>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             {allFields.map((field) => (
//               <TableHead key={field}>{getHeader(field)}</TableHead>
//             ))}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {data.map((item) => (
//             <TableRow key={item.id}>
//               {allFields.map((field) => (
//                 <TableCell key={field}>
//                   {field === "date"
//                     ? item.date
//                       ? new Date(item.date).toLocaleString()
//                       : "-"
//                     : item[field] !== undefined && item[field] !== null
//                     ? item[field]
//                     : "-"}
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }




// "use client"

// import { useState, useMemo } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

// interface DeviceData {
//   id: string
//   name: string
//   [key: string]: any
// }

// interface DeviceDataTableProps {
//   data: DeviceData[]
//   loading: boolean
//   error: string
//   deviceName: string
//   fields?: string[]
//   itemsPerPage?: number
// }

// export function DeviceDataTable({ data, loading, error, deviceName, fields, itemsPerPage = 10 }: DeviceDataTableProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(itemsPerPage)

//   const totalItems = data.length
//   const totalPages = Math.ceil(totalItems / pageSize)

//   const currentData = useMemo(() => {
//     const startIndex = (currentPage - 1) * pageSize
//     const endIndex = startIndex + pageSize
//     return data.slice(startIndex, endIndex)
//   }, [data, currentPage, pageSize])

//   useMemo(() => {
//     setCurrentPage(1)
//   }, [data])

//   if (error) {
//     return (
//       <Alert variant="destructive" className="mb-4">
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center py-4">
//         <Loader2 className="w-8 h-8 animate-spin" />
//       </div>
//     )
//   }

//   const displayDeviceName = deviceName || (data.length > 0 ? data[0].name || "Unknown Device" : "No Data")
//   const displayFields = fields && fields.length > 0 ? fields : ["temperatureValue", "humidityValue"]
//   const allFields = [...displayFields, "date"]

//   const getHeader = (field: string) => {
//     if (field === "date") return "Date"
//     if (field === "deviceId") return "Device ID"
//     return (
//       field
//         .replace(/Value$/, "")
//         .charAt(0)
//         .toUpperCase() +
//       field.replace(/Value$/, "").slice(1) +
//       (field.endsWith("Value") ? " Value" : "")
//     )
//   }

//   const getPageNumbers = () => {
//     const pages = []
//     const maxVisiblePages = 5

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i)
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       } else if (currentPage >= totalPages - 2) {
//         pages.push(1)
//         pages.push("...")
//         for (let i = totalPages - 3; i <= totalPages; i++) {
//           pages.push(i)
//         }
//       } else {
//         pages.push(1)
//         pages.push("...")
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pages.push(i)
//         }
//         pages.push("...")
//         pages.push(totalPages)
//       }
//     }

//     return pages
//   }

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   const handlePageSizeChange = (newPageSize: string) => {
//     setPageSize(Number.parseInt(newPageSize))
//     setCurrentPage(1)
//   }

//   if (totalItems === 0) {
//     return (
//       <div className="rounded-md border p-8 text-center">
//         <h2 className="text-2xl font-bold mb-4">Device: {displayDeviceName}</h2>
//         <p className="text-muted-foreground">No data available</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       <div className="rounded-md border">
//         <div className="p-4 border-b">
//           <h2 className="text-2xl font-bold text-center">Device: {displayDeviceName}</h2>
//           <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
//             <div>
//               Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of{" "}
//               {totalItems} entries
//             </div>
//             <div className="flex items-center space-x-2">
//               <span>Show</span>
//               <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
//                 <SelectTrigger className="w-20">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="5">5</SelectItem>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="20">20</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                 </SelectContent>
//               </Select>
//               <span>entries</span>
//             </div>
//           </div>
//         </div>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               {allFields.map((field) => (
//                 <TableHead key={field}>{getHeader(field)}</TableHead>
//               ))}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {currentData.map((item) => (
//               <TableRow key={item.id}>
//                 {allFields.map((field) => (
//                   <TableCell key={field}>
//                     {field === "date"
//                       ? item.date
//                         ? (() => {
//                             const adjustedDate = new Date(item.date)
//                             adjustedDate.setHours(adjustedDate.getHours() - 5)
//                             adjustedDate.setMinutes(adjustedDate.getMinutes() - 30)
//                             return adjustedDate.toLocaleString()
//                           })()
//                         : "-"
//                       : item[field] !== undefined && item[field] !== null
//                         ? item[field]
//                         : "-"}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {totalPages > 1 && (
//         <div className="flex items-center justify-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//             Previous
//           </Button>

//           <div className="flex items-center space-x-1">
//             {getPageNumbers().map((page, index) => (
//               <div key={index}>
//                 {page === "..." ? (
//                   <span className="px-3 py-2 text-muted-foreground">...</span>
//                 ) : (
//                   <Button
//                     variant={currentPage === page ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handlePageChange(page as number)}
//                     className="w-10"
//                   >
//                     {page}
//                   </Button>
//                 )}
//               </div>
//             ))}
//           </div>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             Next
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       )}

//       <div className="text-center text-sm text-muted-foreground">
//         Page {currentPage} of {totalPages}
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface DeviceData {
  id: string
  name: string
  [key: string]: any
}

interface DeviceDataTableProps {
  data: DeviceData[]
  loading: boolean
  error: string
  deviceName: string
  fields?: string[]
  itemsPerPage?: number // Allow customization of items per page
}

export function DeviceDataTable({ data, loading, error, deviceName, fields, itemsPerPage = 10 }: DeviceDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  // Calculate pagination values
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])

  // Reset to first page when data changes
  useMemo(() => {
    setCurrentPage(1)
  }, [data])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const displayDeviceName = deviceName || (data.length > 0 ? data[0].name || "Unknown Device" : "No Data")

  // Use provided fields or fallback to default
  const displayFields = fields && fields.length > 0 ? fields : ["temperatureValue", "humidityValue"]

  // Always include date as the last column
  const allFields = [...displayFields, "date"]

  // Helper to make headers pretty
  const getHeader = (field: string) => {
    if (field === "date") return "Date"
    if (field === "deviceId") return "Device ID"
    // Remove trailing 'Value' and capitalize
    return (
      field
        .replace(/Value$/, "")
        .charAt(0)
        .toUpperCase() +
      field.replace(/Value$/, "").slice(1) +
      (field.endsWith("Value") ? " Value" : "")
    )
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  if (totalItems === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Device: {displayDeviceName}</h2>
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-center">Device: {displayDeviceName}</h2>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of{" "}
              {totalItems} entries
            </div>
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {allFields.map((field) => (
                <TableHead key={field}>{getHeader(field)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}