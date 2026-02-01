'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { RefreshCw, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Import react-pdf styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReceiptPreviewProps {
  fileUrl: string;
  fileType: string;
  fileName?: string;
}

export function ReceiptPreview({ fileUrl, fileType, fileName }: ReceiptPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPDF = fileType === 'application/pdf' || fileType.includes('pdf');

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF');
    setIsLoading(false);
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleRotate = () => {
    // Could implement rotation if needed
    console.log('Rotate clicked');
  };

  if (isPDF) {
    return (
      <div className="flex flex-col h-full">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
            onClick={handleZoomOut}
          >
            <ZoomOut size={16} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
            onClick={handleZoomIn}
          >
            <ZoomIn size={16} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
            onClick={handleRotate}
          >
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-zinc-800 flex items-center justify-center p-8 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center">
              <p className="font-semibold mb-2">Error Loading PDF</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex flex-col items-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={zoom / 100}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-2xl"
            />
          </Document>
        </div>

        {/* Footer */}
        <div className="bg-zinc-900 p-4 border-t border-zinc-700 text-zinc-400 text-xs flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>Page {pageNumber} of {numPages || '?'}</span>
            {numPages > 1 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
          <span>Zoom: {zoom}%</span>
        </div>
      </div>
    );
  }

  // Image preview
  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
          onClick={handleZoomOut}
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
          onClick={handleZoomIn}
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white backdrop-blur-sm"
          onClick={handleRotate}
        >
          <RefreshCw size={16} />
        </Button>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 bg-zinc-800 flex items-center justify-center p-8 overflow-auto">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transition: 'transform 0.2s ease'
          }}
          className="origin-center"
        >
          <Image
            src={fileUrl}
            alt={fileName || 'Receipt'}
            width={600}
            height={800}
            className="shadow-2xl rounded-lg max-w-full h-auto"
            unoptimized
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load image');
              setIsLoading(false);
            }}
          />
        </div>

        {isLoading && (
          <div className="absolute flex items-center gap-2 text-white">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading image...</span>
          </div>
        )}

        {error && (
          <div className="absolute text-red-400 text-center">
            <p className="font-semibold mb-2">Error Loading Image</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-zinc-900 p-4 border-t border-zinc-700 text-zinc-400 text-xs flex justify-between">
        <span>Image Preview</span>
        <span>Zoom: {zoom}%</span>
      </div>
    </div>
  );
}
