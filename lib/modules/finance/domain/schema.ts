import { z } from "zod";
import { PaymentStatus, DebtStatus } from "./enums";

export const createPaymentSchema = z.object({
  tenantId: z.string().uuid(),
  unitId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().min(1),
  reference: z.string().optional(),
});

export const createDebtSchema = z.object({
  tenantId: z.string().uuid(),
  unitId: z.string().uuid(),
  amount: z.number().positive(),
  concept: z.string().min(1),
  dueDate: z.coerce.date(),
});

export const assignPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  debtId: z.string().uuid(),
  amount: z.number().positive(),
});
