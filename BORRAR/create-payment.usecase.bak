import { PaymentRepository } from "../repository/payment.repository";
import { createPaymentSchema } from "../domain/schema";
import { z } from "zod";

type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export class CreatePaymentUseCase {
  constructor(private paymentRepo: PaymentRepository) {}

  async execute(input: CreatePaymentInput) {
    // 🔹 1. Validación
    const parsed = createPaymentSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error("Invalid payment data");
    }

    const { tenantId, unitId, amount, method, reference } = parsed.data;

    // 🔹 2. Reglas básicas de negocio
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // 🔹 3. Crear payment
    const payment = await this.paymentRepo.create({
      tenantId,
      unitId,
      amount,
      method,
      reference,
    });

    return payment;
  }
}
