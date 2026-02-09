// Contact Types

export const ContactType = {
  PERSON: "person",
  MERCHANT: "merchant",
  BANK: "bank",
  PLATFORM: "platform",
  WALLET: "wallet",
  SYSTEM: "system",
} as const;

export type ContactTypeValue = typeof ContactType[keyof typeof ContactType];

export interface Contact {
  id: string;
  name: string;
  normalizedName: string;
  ContactType?: ContactTypeValue;
  categoryId: string | null;
  nameVariations: string[];
  transactionCount?: number;
  lastTransactionDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  defaultCategory?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

// API Request Types
export interface CreateContactPayload {
  name: string;
  contactType?: ContactTypeValue;
  categoryId?: string;
  bankName?: string;
  description?: string;
  notes?: string;
}

export interface UpdateContactPayload {
  name?: string;
  contactType?: ContactTypeValue;
  categoryId?: string;
  typicalAmountRangeMin?: number;
  typicalAmountRangeMax?: number;
  notes?: string;
}

export interface FindContactPayload {
  contactName: string;
}

export interface IncrementTransactionCountPayload {
  transactionDate: string;
}

// API Response Types
export interface GetAllContactsResponse {
  message: string;
  data: Contact[];
}

export interface GetContactResponse {
  message: string;
  data: Contact;
}

export interface CreateContactResponse {
  message: string;
  data: Contact;
}

export interface UpdateContactResponse {
  message: string;
  data: Contact;
}

export interface FindContactResponse {
  message: string;
  data: {
    id: string;
    name: string;
    normalizedName: string;
    contactType: ContactTypeValue;
    categoryId: string | null;
    nameVariations: string[];
    transactionCount: number;
    lastTransactionDate: string | null;
    matchConfidence: number;
    matchedVariation: string | null;
  } | null;
}

export interface SearchContactsResponse {
  message: string;
  data: Contact[];
}
