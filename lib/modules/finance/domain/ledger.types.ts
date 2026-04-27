export type LedgerEntryType =
  | "PAYMENT_CREATED"
  | "PAYMENT_VERIFIED"
  | "DEBT_CREATED"
  | "PAYMENT_APPLIED";

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amount: number;
  description: string;
  created_at: string;

  property_id: string;
  user_id?: string;
}
