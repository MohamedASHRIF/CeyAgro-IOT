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
  handleDownloadClick: (downloadUrl: string, createdAt: string) => void;
  showExpiredDialog: boolean;
  setShowExpiredDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DownloadHistoryTable({
  history,
  confirmDelete,
  isDeleting,
  currentIndex,
  showConfirmDialog,
  setShowConfirmDialog,
  deleteErrorMessage,
  handlePermanentDelete,
  handleDownloadClick,
  showExpiredDialog,
  setShowExpiredDialog,
}: DownloadHistoryTableProps) {
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-20">Filename</TableHead>
              <TableHead className="px-20">Record Count</TableHead>
              <TableHead className="px-20">Created At</TableHead>
              <TableHead className="px-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="px-5">{item.filename}</TableCell>
                <TableCell className="px-27">{item.recordCount}</TableCell>
                <TableCell className="px-12">
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                  <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        handleDownloadClick(item.downloadUrl, item.createdAt)
                      }
                    >
                      Download Again
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => confirmDelete(index)}
                      disabled={isDeleting && currentIndex === index}
                      className="w-full sm:w-auto"
                    >
                      {isDeleting && currentIndex === index
                        ? "Deleting..."
                        : "Delete"}
                    </Button>

                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      {/* Delete confirmation dialog */}
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
                setShowConfirmDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentIndex !== null && !deleteErrorMessage) {
                  handlePermanentDelete(currentIndex);
                } else {
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



          {/* Expired download link dialog */}
          <AlertDialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Download Link Expired</AlertDialogTitle>
            <AlertDialogDescription>
              This download link has expired (valid for 30 minutes). Please
              generate a new report to get a fresh download link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowExpiredDialog(false)}
              className="w-full sm:w-auto"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}

