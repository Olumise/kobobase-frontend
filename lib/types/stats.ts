// Transaction Stats Types
export interface TransactionsByType {
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER";
  _count: number;
  _sum: {
    amount: number;
  };
}

export interface TransactionStatsData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalTransactions: number;
  transactionsByType: TransactionsByType[];
}

export interface TransactionStatsResponse {
  message: string;
  data: TransactionStatsData;
}

export interface StatsQueryParams {
  startDate?: string;
  endDate?: string;
}

// Usage Stats Types
export interface CallCounts {
  ocr: number;
  detection: number;
  extraction: number;
  clarification: number;
  embedding: number;
}

export interface SessionCounts {
  clarification: number;
  batch: number;
  sequential: number;
}

export interface CurrentMonthUsage {
  tokensUsed: number;
  costUsd: number;
  monthStartDate: string;
}

export interface UsageStatsData {
  tokensUsed: number;
  costUsd: number;
  sessionCounts: SessionCounts;
  callCounts: CallCounts;
  currentMonth?: CurrentMonthUsage;
}

export interface UsageStatsResponse {
  success: boolean;
  data: UsageStatsData;
}

// Usage Session Types
export interface CallBreakdownItem {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface CallBreakdown {
  ocr?: CallBreakdownItem;
  detection?: CallBreakdownItem;
  extraction?: CallBreakdownItem;
  clarification?: CallBreakdownItem;
  embedding?: CallBreakdownItem;
}

export interface UsageSession {
  id: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  callBreakdown: CallBreakdown;
  receiptId: string;
  documentType: string;
  transactionCount: number;
  processingMode: "clarification" | "batch" | "sequential";
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

export interface UsageSessionsResponse {
  success: boolean;
  data: UsageSession[];
}

// Usage Breakdown Types
export interface BreakdownItem {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface BreakdownData {
  ocr: BreakdownItem;
  detection: BreakdownItem;
  extraction: BreakdownItem;
  clarification: BreakdownItem;
  embedding: BreakdownItem;
}

export interface UsageBreakdownData {
  summary: UsageStatsData;
  breakdown: BreakdownData;
}

export interface UsageBreakdownResponse {
  success: boolean;
  data: UsageBreakdownData;
}

export interface UsageQueryParams {
  period?: "all-time" | "current-month";
  limit?: number;
}
