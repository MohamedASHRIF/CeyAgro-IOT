import type React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DownloadHistory {
  filename: string;
  downloadUrl: string;
  createdAt: string;
  recordCount: number;
}

interface DownloadHistoryTableProps {
  history: DownloadHistory[];
  onDelete: (index: number) => void;
}

export function DownloadHistoryTable({ history, onDelete }: DownloadHistoryTableProps) {
  return (
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
              <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-30">
                  <Button variant="outline" asChild>
                    <a href={item.downloadUrl} download>
                      Download Again
                    </a>
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(index)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}