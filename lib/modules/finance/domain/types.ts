import { PaymentStatus } from "./enums";

export type Payment = {
  id: string;
  tenantId: string;
  unitId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  createdAt: Date;
};

export type PaymentMethod = "PAGOMOVIL" | "TRANSFERENCIA" | "EFECTIVO";

export * from "./debts.types";
