import { PaymentRepository } from "../repository/payment.repository";
import { DebtRepository } from "../repository/debt.repository";
import { AllocationRepository } from "../repository/allocation.repository";

type GetLedgerInput = {
  tenantId: string;
  unitId: string;
};

export class GetLedgerUseCase {
  constructor(
    private paymentRepo: PaymentRepository,
    private debtRepo: DebtRepository,
    private allocationRepo: AllocationRepository,
  ) {}

  async execute(input: GetLedgerInput) {
    const { tenantId, unitId } = input;

    // 🔹 1. Obtener datos
    const debts = await this.debtRepo.findByUnit(unitId, tenantId);
    const payments = await this.paymentRepo.findByUnit(unitId, tenantId);

    // 🔹 2. Obtener allocations por payments
    const allocations = await this.allocationRepo.findByTenantAndUnit(
      tenantId,
      unitId,
    );

    // mapear allocations por deuda
    const allocationMap = new Map<string, number>();

    for (const a of allocations) {
      const current = allocationMap.get(a.debtId) || 0;
      allocationMap.set(a.debtId, current + a.amount);
    }

    // reconstruir debts correctamente
    const normalizedDebts = debts.map((d) => {
      const paidAmount = allocationMap.get(d.id) || 0;

      let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";

      if (paidAmount >= d.amount) status = "PAID";
      else if (paidAmount > 0) status = "PARTIAL";

      return {
        ...d,
        paidAmount,
        status,
      };
    });

    // 🔹 3. Calcular totales
    const totalDebt = normalizedDebts.reduce((sum, d) => sum + d.amount, 0);

    const totalPaid = normalizedDebts.reduce((sum, d) => sum + d.paidAmount, 0);

    const balance = totalDebt - totalPaid;

    return {
      debts,
      payments,
      allocations,
      balance,
    };
  }
}
