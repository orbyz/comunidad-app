import { DebtRepository } from "../repository/debt.repository";
import { createDebtSchema } from "../domain/schema";
import { z } from "zod";

type CreateDebtInput = z.infer<typeof createDebtSchema>;

export class CreateDebtUseCase {
  constructor(private debtRepo: DebtRepository) {}

  async execute(input: CreateDebtInput) {
    // 🔹 1. Validación
    const parsed = createDebtSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error("Invalid debt data");
    }

    const { tenantId, unitId, amount, concept, dueDate } = parsed.data;

    // 🔹 2. Reglas básicas
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const today = new Date();
    if (dueDate < new Date(today.setHours(0, 0, 0, 0))) {
      throw new Error("Due date cannot be in the past");
    }

    // 🔹 3. Crear deuda
    const debt = await this.debtRepo.create({
      tenantId,
      unitId,
      amount,
      concept,
      dueDate,
    });

    return debt;
  }
}
