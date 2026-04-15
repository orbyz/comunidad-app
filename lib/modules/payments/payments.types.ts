export type PaymentMethod = "PAGOMOVIL" | "TRANSFERENCIA" | "EFECTIVO";
export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Payment {
  id: string;
  user_id?: string;
  property_id?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  created_at: string;
}
