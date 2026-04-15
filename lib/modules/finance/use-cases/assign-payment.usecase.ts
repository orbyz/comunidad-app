import { TransactionRepository } from "../repository/transaction.repository";
import { DebtRepository } from "../repository/debt.repository";
import { AllocationRepository } from "../repository/allocation.repository";

type Input = {
  paymentId: string;
  debtId: string;
  amount: number;
  tenantId: string;
};

export class AssignPaymentToDebtUseCase {
  constructor(
    private txRepo: TransactionRepository,
    private debtRepo: DebtRepository,
    private allocationRepo: AllocationRepository,
  ) {}

  async execute(input: Input) {
    const { paymentId, debtId, amount, tenantId } = input;

    // 🔹 1. obtener deuda
    const debt = await this.debtRepo.findById(debtId, tenantId);

    if (!debt) {
      throw new Error("Debt not found");
    }

    // 🔹 2. calcular ya asignado
    const allocations = await this.allocationRepo.findByPayment(paymentId);

    const alreadyAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

    // 🔥 VALIDACIÓN CRÍTICA
    if (alreadyAllocated + amount > debt.amount) {
      throw new Error("Overpayment not allowed");
    }

    // 🔹 3. crear allocation
    await this.allocationRepo.create({
      paymentId,
      debtId,
      amount,
    });

    return { success: true };
  }
}
