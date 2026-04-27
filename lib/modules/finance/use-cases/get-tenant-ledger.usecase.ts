import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "../repository/debt.repository";
import { AllocationRepository } from "../repository/allocation.repository";

type Input = {
  tenantId: string;
};

type PropertyLedger = {
  unitId: string;
  totalDebt: number;
  totalPaid: number;
  pending: number;
  status: "PENDING" | "PARTIAL" | "PAID";
};

export class GetTenantLedgerUseCase {
  constructor(
    private paymentRepo: PaymentRepository,
    private debtRepo: DebtRepository,
    private allocationRepo: AllocationRepository,
  ) {}

  async execute({ tenantId }: Input) {
    // 🔹 1. Obtener datos base
    const debts = await this.debtRepo.findByTenant(tenantId);
    const payments = await this.paymentRepo.findByTenant(tenantId);
    const allocations = await this.allocationRepo.findByTenant(tenantId);

    // 🔹 2. Crear mapa de allocations por deuda
    const allocationMap = new Map<string, number>();

    for (const a of allocations) {
      const current = allocationMap.get(a.debtId) || 0;
      allocationMap.set(a.debtId, current + a.amount);
    }

    // 🔹 3. Agrupar por propiedad (unitId)
    const propertyMap = new Map<string, PropertyLedger>();

    for (const d of debts) {
      const paidAmount = allocationMap.get(d.id) || 0;

      const existing = propertyMap.get(d.unitId);

      if (!existing) {
        propertyMap.set(d.unitId, {
          unitId: d.unitId,
          totalDebt: d.amount,
          totalPaid: paidAmount,
          pending: 0,
          status: "PENDING",
        });
      } else {
        existing.totalDebt += d.amount;
        existing.totalPaid += paidAmount;
      }
    }

    // 🔹 4. Calcular pendientes y estado
    const properties = Array.from(propertyMap.values()).map((p) => {
      const pending = p.totalDebt - p.totalPaid;

      let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";

      if (pending === 0) status = "PAID";
      else if (p.totalPaid > 0) status = "PARTIAL";

      return {
        ...p,
        pending,
        status,
      };
    });

    // 🔹 5. KPIs globales
    const totalDebt = properties.reduce((sum, p) => sum + p.totalDebt, 0);

    const totalPaid = properties.reduce((sum, p) => sum + p.totalPaid, 0);

    const balance = totalDebt - totalPaid;

    return {
      properties,
      totalDebt,
      totalPaid,
      balance,
    };
  }
}
