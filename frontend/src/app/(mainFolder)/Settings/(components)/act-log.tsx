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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, X } from "lucide-react";

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
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [bulkDeleteType, setBulkDeleteType] = useState<'selected' | 'by_action' | 'by_date'>('selected');
  const [bulkActionFilter, setBulkActionFilter] = useState<string>('REGISTER_DEVICE');
  const [bulkDateFilter, setBulkDateFilter] = useState<string>('TODAY');
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

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

  // Individual delete function
  const handleDeleteSingle = async (logId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/activity-log/${logId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email }),
        }
      );

      if (res.ok) {
        setLogs(prev => prev.filter(log => log._id !== logId));
        setShowSingleDeleteDialog(false);
        setLogToDelete(null);
      } else {
        console.error("Failed to delete activity log");
      }
    } catch (err) {
      console.error("Error deleting activity log:", err);
    }
  };

  // Open single delete dialog
  const openSingleDeleteDialog = (logId: string) => {
    setLogToDelete(logId);
    setShowSingleDeleteDialog(true);
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedLogs.size === paginatedLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(paginatedLogs.map(log => log._id)));
    }
  };

  // Toggle individual selection
  const handleSelectLog = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    const logsToDelete = Array.from(selectedLogs);
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/activity-log/bulk-delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: user?.email,
            logIds: logsToDelete,
            deleteType: 'selected'
          }),
        }
      );

      if (res.ok) {
        setLogs(prev => prev.filter(log => !logsToDelete.includes(log._id)));
        setSelectedLogs(new Set());
        setShowBulkDeleteDialog(false);
        setDeleteMode(false);
      } else {
        console.error("Failed to bulk delete activity logs");
      }
    } catch (err) {
      console.error("Error bulk deleting activity logs:", err);
    }
  };

  if (selectedChanges) {
    console.log("RAW selectedChanges:", selectedChanges);
  }

  if (authLoading || loading) return (
    <div
      className="flex items-center justify-center h-screen"
      role="status"
      aria-label="Loading"
    >
      <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!user?.email) return <div>User not authenticated.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {filteredLogs.length} activities
          {deleteMode && selectedLogs.size > 0 && (
            <span className="ml-2 text-teal-600">
              ({selectedLogs.size} selected)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {filteredLogs.length > 0 && (
            <>
              <Button
                variant={deleteMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setDeleteMode(!deleteMode);
                  setSelectedLogs(new Set());
                }}
              >
                {deleteMode ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Select to Delete
                  </>
                )}
              </Button>
              
              {deleteMode && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={selectedLogs.size === 0}
                >
                  Delete Selected ({selectedLogs.size})
                </Button>
              )}
              
              <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your activity logs. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/activity-log/clear`,
                            {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: user.email }),
                            }
                          );

                          if (res.ok) {
                            setLogs([]);
                            setShowClearDialog(false);
                          } else {
                            console.error("Failed to clear activity log");
                          }
                        } catch (err) {
                          console.error("Error clearing activity log:", err);
                        }
                      }}
                    >
                      Yes, delete all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

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

      {/* Select All Checkbox (only in delete mode) */}
      {deleteMode && filteredLogs.length > 0 && (
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="select-all"
            checked={selectedLogs.size === paginatedLogs.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select all on this page
          </label>
        </div>
      )}

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
                  <div className="flex items-center space-x-2">
                    {deleteMode && (
                      <Checkbox
                        checked={selectedLogs.has(log._id)}
                        onCheckedChange={() => handleSelectLog(log._id)}
                      />
                    )}
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {formatDistanceToNow(parseISO(log.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {!deleteMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSingleDeleteDialog(log._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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

      {/* Single Delete Dialog */}
      <AlertDialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity log? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => logToDelete && handleDeleteSingle(logToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Activity Logs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLogs.size} selected activity logs? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleBulkDelete}
            >
              Delete {selectedLogs.size} logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <ul className="ml-4 mt-2 list-disc text-md text-gray-700">
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
                        <div className="text-md text-gray-500">Old Value:</div>
                        <ul className="list-disc ml-4 text-md text-red-500">
                          {(Array.isArray(oldValue) ? oldValue : []).map(
                            (item, index) => (
                              <li key={`old-${index}`}>
                                {item.type} (Min: {item.minValue}, Max: {item.maxValue})
                              </li>
                            )
                          )}
                        </ul>
                        <div className="text-md text-gray-500 mt-1">New Value:</div>
                        <ul className="list-disc ml-4 text-md text-green-600">
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