// Receipt Upload and Extraction Types

export interface UploadReceiptResponse {
  id: string;
  userId: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  rawOcrText: string | null;
  processedAt: string | null;
  uploadedAt: string;
  processingStatus: 'pending' | 'processing' | 'processed' | 'failed';
  documentType: string | null;
  expectedTransactions: number | null;
  processedTransactions: number;
  detectionCompleted: boolean;
  extractionMetadata: ExtractionMetadata | null;
}

export interface ExtractionMetadata {
  isPDF: boolean;
  isScanned?: boolean;
  pageCount?: number;
  extractionMethod?: 'native' | 'ocr';
  ocrConfidence?: number;
  processingTime?: number;
}

export interface DocumentCharacteristics {
  has_header: boolean;
  has_totals: boolean;
  has_multiple_dates: boolean;
  has_transaction_list: boolean;
  quality_issues: string[];
}

export interface TransactionPreview {
  amount: number;
  date: string;
  description: string;
}

export interface DocumentDetection {
  document_type: 'single_receipt' | 'bank_statement' | 'batch_receipt' | 'unknown';
  transaction_count: number;
  confidence: number;
  document_characteristics: DocumentCharacteristics;
  recommended_mode: 'single' | 'sequential' | 'batch';
  transaction_preview: TransactionPreview[];
  notes: string;
}

export interface ExtractReceiptResponse {
  receipt: UploadReceiptResponse;
  detection: DocumentDetection;
  processingMode: 'single' | 'sequential' | 'batch';
  isMultiTransaction: boolean;
}

// Error response structure
export interface ApiErrorResponse {
  message: string;
  url: string;
  statusCode?: number;
}

// Error types for better error handling
export type UploadError =
  | 'NO_FILE_UPLOADED'
  | 'S3_UPLOAD_FAILED'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

export type ExtractionError =
  | 'MISSING_RECEIPT_ID'
  | 'INVALID_RECEIPT_ID'
  | 'RECEIPT_NOT_FOUND'
  | 'TRANSACTION_LIMIT_EXCEEDED'
  | 'PDF_PAGE_LIMIT_EXCEEDED'
  | 'NO_TRANSACTIONS_FOUND'
  | 'UNAUTHORIZED_ACCESS'
  | 'USER_NOT_FOUND'
  | 'BANK_ACCOUNT_NOT_FOUND'
  | 'PDF_EXTRACTION_FAILED'
  | 'OCR_EXTRACTION_FAILED'
  | 'GOOGLE_OCR_API_ERROR'
  | 'JSON_PARSING_ERROR'
  | 'DOCUMENT_DETECTION_FAILED'
  | 'AI_TOOL_EXECUTION_FAILED'
  | 'FILE_DOWNLOAD_FAILED'
  | 'PDF_PARSING_TIMEOUT'
  | 'UNKNOWN_ERROR';

export class ReceiptUploadError extends Error {
  constructor(
    public type: UploadError,
    message: string,
    public url?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ReceiptUploadError';
  }
}

export class ReceiptExtractionError extends Error {
  constructor(
    public type: ExtractionError,
    message: string,
    public url?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ReceiptExtractionError';
  }
}
