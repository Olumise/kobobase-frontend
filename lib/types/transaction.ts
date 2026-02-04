// Transaction and Batch Session Types

export interface TransactionExtraction {
  notes: string;
  questions: any;
  is_complete: string;
  transaction: {
    fees: number;
    amount: number;
    status: string;
    summary: string;
    category: string;
    currency: string;
    raw_input: string;
    time_sent: string;
    description: string;
    sender_bank: string;
    sender_name: string;
    receiver_bank: string;
    receiver_name: string;
    payment_method: string;
    transaction_type: string;
    transaction_direction: string;
    transaction_reference: string;
    receiver_account_number: string;
  } | null; // Can be null when needs clarification
  missing_fields: any;
  enrichment_data: {
    contact_id: string;
    category_id: string;
    to_bank_account_id: string | null;
    is_self_transaction: boolean;
    user_bank_account_id: string;
  } | null; // Can be null when transaction is null
  confidence_score: number;
  transaction_index: number;
  needs_confirmation: boolean;
  needs_clarification: boolean;
  clarification_session_id: string | null;
}

export interface BatchSession {
  id: string;
  receiptId: string;
  userId: string;
  totalExpected: number;
  totalProcessed: number;
  currentIndex: number;
  processingMode: string;
  status: 'in_progress' | 'completed' | 'failed';
  extractedData: {
    detection?: {
      notes?: string;
      confidence?: number;
      document_type?: string;
      processing_mode?: string;
      transaction_count?: number;
      transaction_preview?: Array<{
        date: string;
        amount: number;
        description: string;
      }>;
      document_characteristics?: {
        date_range?: {
          start: string;
          end: string;
        };
        is_tabular_format?: boolean;
        has_multiple_dates?: boolean;
        has_summary_totals?: boolean;
      };
    };
    toolCalls?: Array<{
      id: string;
      name: string;
      args: Record<string, any>;
    }>;
    aiResponse?: string;
    autoToolResults?: Record<string, any>;
    confirmationTools?: any[];
    transactionPreview?: Array<{
      date: string;
      amount: number;
      description: string;
    }>;
    extraction_response?: {
      transactions: TransactionExtraction[];
    };
    transaction_results?: TransactionExtraction[];
  };
  startedAt?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  receipt?: {
    id: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  };
  llmUsage?: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  merchant?: string;
  transactionDate: string;
  transactionType: string;
  category?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  aiConfidence?: number;
  receiptId: string;
}


export interface ReviewTransaction {
    transaction_index: number;
    is_complete: string;
    confidence_score: number;
    transaction: {
        transaction_type: string;
        amount: number;
        currency: string;
        transaction_direction: string;
        payment_method: string;
        fees: number;
        description: string;
        category: string;
        sender_name: string;
        sender_bank: string;
        receiver_name: string;
        receiver_bank: string;
        receiver_account_number: string;
        time_sent: string;
        status: string;
        transaction_reference: string;
        raw_input: string;
        summary: string;
    } | null;
    missing_fields: string[] | null;
    questions: string[] | null;
    enrichment_data: {
        category_id: string | null;
        contact_id: string | null;
        user_bank_account_id: string | null;
        to_bank_account_id: string | null;
        is_self_transaction: boolean;
    } | null;
    notes: string;
    needs_clarification: boolean;
    needs_confirmation: boolean;
    clarification_session_id: string | null;
}


