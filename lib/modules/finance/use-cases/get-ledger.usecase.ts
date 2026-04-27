import { PaymentRepository } from "../repository/payment.repository";
import { DebtRepository } from "../repository/debt.repository";
import { AllocationRepository } from "../repository/allocation.repository";

type GetLedgerInput = {
  tenantId: string;
  unitId: string;
};

type LedgerEntry = {
  id: string;
  type: "DEBT" | "PAYMENT" | "ALLOCATION";
  amount: number;
  description: string;
  created_at: string;
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
    const allocations = await this.allocationRepo.findByTenantAndUnit(
      tenantId,
      unitId,
    );

    // 🔹 2. MAP allocations por deuda
    const allocationMap = new Map<string, number>();

    for (const a of allocations) {
      const current = allocationMap.get(a.debtId) || 0;
      allocationMap.set(a.debtId, current + a.amount);
    }

    // 🔹 3. NORMALIZAR DEUDAS
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

    // 🔹 4. CALCULOS
    const totalDebt = normalizedDebts.reduce((sum, d) => sum + d.amount, 0);

    const totalPaid = normalizedDebts.reduce((sum, d) => sum + d.paidAmount, 0);

    const balance = totalDebt - totalPaid;

    // 🔥 5. CONSTRUIR LEDGER (AQUÍ ESTÁ EL SALTO PRO)
    const ledger: LedgerEntry[] = [];

    // 🟥 DEUDAS
    for (const d of debts) {
      ledger.push({
        id: d.id,
        type: "DEBT",
        amount: -Number(d.amount),
        description: "Deuda generada",
        created_at: d.created_at,
      });
    }

    // 🟩 PAGOS (registro)
    for (const p of payments) {
      ledger.push({
        id: p.id,
        type: "PAYMENT",
        amount: Number(p.amount),
        description: `Pago registrado (${p.method})`,
        created_at: p.created_at,
      });
    }

    // 🟦 ALLOCATIONS (CLAVE FINANCIERA REAL)
    for (const a of allocations) {
      ledger.push({
        id: a.id,
        type: "ALLOCATION",
        amount: Number(a.amount),
        description: "Pago aplicado a deuda",
        created_at: a.created_at,
      });
    }

    // 🔥 6. ORDENAR (IMPORTANTE)
    ledger.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // 🔥 7. RETURN PRO
    return {
      debts: normalizedDebts,
      payments,
      allocations,
      ledger, // 👈 NUEVO (CLAVE)
      balance,
      totalDebt,
      totalPaid,
    };
  }
}
