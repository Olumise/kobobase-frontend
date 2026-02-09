// Bank Account Types

export const AccountType = {
  SAVINGS: "savings",
  CURRENT: "current",
  WALLET: "wallet",
  CARD: "card",
  OTHER: "other",
} as const;

export type AccountTypeValue = typeof AccountType[keyof typeof AccountType];

export interface BankAccount {
  id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: AccountTypeValue;
  currency: string;
  nickname?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request Types
export interface CreateBankAccountPayload {
  accountName: string;
  accountNumber?: string;
  bankName: string;
  accountType?: AccountTypeValue;
  currency?: string;
  nickname?: string;
  isPrimary?: boolean;
}

export interface UpdateBankAccountPayload {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  accountType?: AccountTypeValue;
  currency?: string;
  nickname?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface MatchBankAccountPayload {
  bankName: string;
  accountNumber?: string;
}

// API Response Types
export interface GetBankAccountsResponse {
  message: string;
  data: {
    accounts: BankAccount[];
    total: number;
    primaryAccount?: {
      id: string;
      accountName: string;
      isPrimary: boolean;
    };
  };
}

export interface GetBankAccountResponse {
  message: string;
  data: BankAccount;
}

export interface CreateBankAccountResponse {
  message: string;
  data: {
    account: BankAccount;
    created: boolean;
    message: string;
  };
}

export interface UpdateBankAccountResponse {
  message: string;
  data: BankAccount;
}

export interface DeleteBankAccountResponse {
  message: string;
}

export interface MatchBankAccountResponse {
  message: string;
  data: BankAccount | null;
}

export interface SetPrimaryAccountResponse {
  message: string;
  data: {
    id: string;
    userId: string;
    accountName: string;
    isPrimary: boolean;
    isActive: boolean;
  };
}
