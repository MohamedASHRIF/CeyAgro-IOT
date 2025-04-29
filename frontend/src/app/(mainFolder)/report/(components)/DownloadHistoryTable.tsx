import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DownloadHistory {
  filename: string;
  downloadUrl: string;
  createdAt: string;
  recordCount: number;
}

interface DownloadHistoryTableProps {
  history: DownloadHistory[];
  onDelete: (index: number) => void;
  confirmDelete: (index: number) => void;
  isDeleting: boolean;
  currentIndex: number | null;
  showConfirmDialog: boolean;
  setShowConfirmDialog: React.Dispatch<React.SetStateAction<boolean>>;
  deleteErrorMessage: string;
  handlePermanentDelete: (index: number) => Promise<void>;
}

export function DownloadHistoryTable({
  history,
  onDelete,
  confirmDelete,
  isDeleting,
  currentIndex,
  showConfirmDialog,
  setShowConfirmDialog,
  deleteErrorMessage,
  handlePermanentDelete,
}: DownloadHistoryTableProps) {
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Record Count</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.filename}</TableCell>
                <TableCell>{item.recordCount}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-30">
                    <Button variant="outline" asChild>
                      <a href={item.downloadUrl} download>
                        Download Again
                      </a>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => confirmDelete(index)}
                      disabled={isDeleting && currentIndex === index}
                    >
                      {isDeleting && currentIndex === index ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file.
              {deleteErrorMessage && (
                <span className="mt-2 text-red-500 block">{deleteErrorMessage}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false); // Close dialog on cancel
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentIndex !== null && !deleteErrorMessage) {
                  // Only attempt deletion if no error is already displayed
                  handlePermanentDelete(currentIndex);
                } else {
                  // Close dialog if error is displayed
                  setShowConfirmDialog(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

