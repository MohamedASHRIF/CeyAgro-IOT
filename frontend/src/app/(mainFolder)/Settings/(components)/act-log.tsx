"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  subDays,
  isAfter,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Activity = {
  _id: string;
  email: string;
  action: "REGISTER_DEVICE" | "EDIT_DEVICE" | "DELETE_DEVICE";
  deviceId?: string;
  message?: string;
  createdAt: string;
  changes?: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
};

const ITEMS_PER_PAGE = 10;
const FIELD_LABELS: Record<string, string> = {
  deviceName: "Device Name",
  location: "Location",
  description: "Description",
  deviceImage: "Device Image",
  deviceTypes: "Device Types",
};


// Relevant schema fields to show
const SCHEMA_FIELDS = [
  "deviceName",
  "location",
  "description",
  "deviceImage",
  "deviceTypes",
];

// Utility function for deep comparison of deviceTypes arrays
const areDeviceTypesEqual = (
  oldValue: any[] | null | undefined,
  newValue: any[] | null | undefined
): boolean => {
  if (!Array.isArray(oldValue) || !Array.isArray(newValue)) {
    return JSON.stringify(oldValue) === JSON.stringify(newValue);
  }
  if (oldValue.length !== newValue.length) {
    return false;
  }

  const normalize = (arr: any[]) =>
    [...arr]
      .map((item) => ({
        type: item.type ?? "",
        minValue: String(item.minValue ?? ""),
        maxValue: String(item.maxValue ?? ""),
      }))
      .sort((a, b) => a.type.localeCompare(b.type));

  const sortedOld = normalize(oldValue);
  const sortedNew = normalize(newValue);

  return sortedOld.every((item, index) => {
    const newItem = sortedNew[index];
    return (
      item.type === newItem.type &&
      item.minValue === newItem.minValue &&
      item.maxValue === newItem.maxValue
    );
  });
};


export default function ActivityLogCard() {
  const { user, isLoading: authLoading } = useUser();
  const [logs, setLogs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChanges, setSelectedChanges] = useState<{
    [key: string]: { oldValue: any; newValue: any };
  } | null>(null);

  useEffect(() => {
    if (!user?.email || authLoading) return;

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/activity-log?email=${encodeURIComponent(
        user.email
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.email, authLoading]);

  const filterByAction = (log: Activity) =>
    actionFilter === "ALL" || log.action === actionFilter;

  const filterByDate = (log: Activity) => {
    if (dateFilter === "ALL") return true;
    const logDate = parseISO(log.createdAt);
    switch (dateFilter) {
      case "TODAY":
        return isToday(logDate);
      case "YESTERDAY":
        return isYesterday(logDate);
      case "LAST_7_DAYS":
        return isAfter(logDate, subDays(new Date(), 7));
      case "LAST_30_DAYS":
        return isAfter(logDate, subDays(new Date(), 30));
      default:
        return true;
    }
  };

  const filteredLogs = logs.filter(
    (log) => filterByAction(log) && filterByDate(log)
  );

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter, dateFilter]);

  if (selectedChanges) {
  console.log("RAW selectedChanges:", selectedChanges);
}


  if (authLoading || loading) return  <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-label="Loading"
      >
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>;
  if (!user?.email) return <div>User not authenticated.</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap mb-4">
        <div className="w-full sm:w-35">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="border-3">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              <SelectItem value="REGISTER_DEVICE">Registered</SelectItem>
              <SelectItem value="EDIT_DEVICE">Edited</SelectItem>
              <SelectItem value="DELETE_DEVICE">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-35">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="border-3">
              <SelectValue placeholder="Filter by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any Date</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="YESTERDAY">Yesterday</SelectItem>
              <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
              <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log List */}
      {filteredLogs.length === 0 ? (
        <div className="text-gray-500">No activity logs found.</div>
      ) : (
        <>
          {paginatedLogs.map((log) => (
            <Card
              key={log._id}
              className={`rounded-xl shadow-sm hover:shadow-md transition border-l-4 ${
                log.action === "DELETE_DEVICE"
                  ? "border-red-500"
                  : log.action === "REGISTER_DEVICE"
                  ? "border-green-500"
                  : log.action === "EDIT_DEVICE"
                  ? "border-yellow-500"
                  : "border-gray-300"
              }`}
            >
              <CardContent className="p-3 py-2">
                <div className="flex justify-between items-center mb-1">
                  <Badge
                    variant="outline"
                    className={`text-xs border-2 ${
                      log.action === "DELETE_DEVICE"
                        ? "border-red-500 text-red-600"
                        : log.action === "REGISTER_DEVICE"
                        ? "border-green-500 text-green-600"
                        : log.action === "EDIT_DEVICE"
                        ? "border-yellow-500 text-yellow-600"
                        : "border-gray-300"
                    }`}
                  >
                    {log.action.replace("_", " ")}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(parseISO(log.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-md text-gray-800 truncate">{log.message}</p>
               {log.deviceId && (
  <div className="text-sm text-gray-500 mt-0.5">
    Device ID: {log.deviceId}
    {(log.action === "REGISTER_DEVICE" || log.action === "EDIT_DEVICE") && (
      <>
        {" • "}
        <a
          href={`/devices/${log.deviceId}`}
          className="text-teal-600 cursor-pointer ml-1"
        >
          View Device
        </a>
      </>
    )}
  </div>
)}

                {log.changes &&
                  Object.keys(log.changes).some((key) =>
                    SCHEMA_FIELDS.includes(key)
                  ) && (
                    <button
                      onClick={() => setSelectedChanges(log.changes!)}
                      className="text-sm text-teal-600 mt-1"
                    >
                      View Changes
                    </button>
                  )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={handlePrev}
              className="bg-transparent hover:bg-gray-100"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={handleNext}
              className="bg-transparent hover:bg-gray-100"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Changes Dialog */}
    <Dialog
  open={
    !!selectedChanges &&
    Object.keys(selectedChanges).some((key) =>
      SCHEMA_FIELDS.includes(key)
    )
  }
  onOpenChange={(open) => {
    if (!open) setSelectedChanges(null);
  }}
>
  <DialogContent>
    <DialogHeader className="flex justify-between items-center">
      <DialogTitle>Updated Details</DialogTitle>
      <button onClick={() => setSelectedChanges(null)}></button>
    </DialogHeader>

    {selectedChanges && (
      <ul className="ml-4 mt-2 list-disc text-sm text-gray-700">
        {Object.entries(selectedChanges)
          .filter(([key, { oldValue, newValue }]) => {
            if (key === "deviceTypes") {
              return !areDeviceTypesEqual(oldValue, newValue);
            }
            if (key === "deviceImage") {
              return true; // force-show for debug
            }
            return oldValue !== newValue;
          })
          .filter(([key]) => SCHEMA_FIELDS.includes(key))
          .map(([key, { oldValue, newValue }]) => (
            <li key={key} className="mb-3">
             <strong>{FIELD_LABELS[key] || key}:</strong>{" "}
              {key === "deviceTypes" ? (
                <div className="mt-1 ml-2 space-y-1">
                  <div className="text-sm text-gray-500">Old Value:</div>
                  <ul className="list-disc ml-4 text-sm text-red-500">
                    {(Array.isArray(oldValue) ? oldValue : []).map(
                      (item, index) => (
                        <li key={`old-${index}`}>
                          {item.type} (Min: {item.minValue}, Max: {item.maxValue})
                        </li>
                      )
                    )}
                  </ul>
                  <div className="text-sm text-gray-500 mt-1">New Value:</div>
                  <ul className="list-disc ml-4 text-sm text-green-600">
                    {(Array.isArray(newValue) ? newValue : []).map(
                      (item, index) => (
                        <li key={`new-${index}`}>
                          {item.type} (Min: {item.minValue}, Max: {item.maxValue})
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : key === "deviceImage" ? (
                <div className="mt-1 ml-2 space-y-2">
                  <div className="text-sm text-gray-500">Old Image URL:</div>
                  <a
                    href={oldValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-500 underline break-all"
                  >
                    {String(oldValue) || "N/A"}
                  </a>
                  <div className="text-sm text-gray-500 mt-1">New Image URL:</div>
                  <a
                    href={newValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 underline break-all"
                  >
                    {String(newValue) || "N/A"}
                  </a>
                </div>
              ) : (
                <>
                  <span className="text-red-500 break-all">{String(oldValue)}</span>{" "}
                  <span className="text-green-600 break-all">
                    → {String(newValue)}
                  </span>
                </>
              )}
            </li>
          ))}
      </ul>
    )}

    <DialogFooter className="mt-4">
      <Button onClick={() => setSelectedChanges(null)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


    </div>
  );
}