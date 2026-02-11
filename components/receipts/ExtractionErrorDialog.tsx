'use client';

import { useState, useRef } from 'react';
import {
  AlertTriangle,
  Upload,
  Trash2,
  FileText,
  Loader2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExtractionErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  onUpdateFile: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function ExtractionErrorDialog({
  isOpen,
  onClose,
  errorMessage,
  onUpdateFile,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: ExtractionErrorDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpdateClick = async () => {
    if (selectedFile) {
      await onUpdateFile(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleDeleteClick = async () => {
    await onDelete();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Processing Failed</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            We encountered an error while processing your receipt.
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Upload a new file</p>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or PDF (max 10 pages)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={isDeleting || isUpdating}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Receipt
              </>
            )}
          </Button>

          <Button
            onClick={handleUpdateClick}
            disabled={!selectedFile || isUpdating || isDeleting}
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Update & Retry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
