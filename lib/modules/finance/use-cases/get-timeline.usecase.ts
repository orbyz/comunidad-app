import { PaymentRepository } from "../repository/payment.repository";
import { DebtRepository } from "../repository/debt.repository";
import { AllocationRepository } from "../repository/allocation.repository";
import { TimelineEvent } from "../domain/timeline.types";

type Input = {
  tenantId: string;
  unitId: string;
};

export class GetTimelineUseCase {
  constructor(
    private paymentRepo: PaymentRepository,
    private debtRepo: DebtRepository,
    private allocationRepo: AllocationRepository,
  ) {}

  async execute(input: Input): Promise<TimelineEvent[]> {
    const { tenantId, unitId } = input;

    const debts = await this.debtRepo.findByUnit(unitId, tenantId);
    const payments = await this.paymentRepo.findByUnit(unitId, tenantId);

    // 🔹 1. Eventos de deuda
    const debtEvents: TimelineEvent[] = debts.map((d) => ({
      id: `debt-${d.id}`,
      type: "DEBT_CREATED",
      date: d.dueDate,
      amount: d.amount,
      description: `Deuda generada`,
    }));

    // 🔹 2. Eventos de pago
    const paymentEvents: TimelineEvent[] = payments.map((p) => ({
      id: `payment-${p.id}`,
      type: "PAYMENT_CREATED",
      date: p.createdAt,
      amount: p.amount,
      description: `Pago registrado (${p.method})`,
    }));

    // 🔹 3. Eventos de aplicación (allocations)
    const allocationEvents: TimelineEvent[] = [];

    for (const p of payments) {
      const allocations = await this.allocationRepo.findByPayment(p.id);

      for (const a of allocations) {
        allocationEvents.push({
          id: `alloc-${a.id}`,
          type: "PAYMENT_APPLIED",
          date: a.createdAt,
          amount: a.amount,
          description: `Pago aplicado a deuda`,
        });
      }
    }

    // 🔹 4. Unificar + ordenar
    const timeline = [
      ...debtEvents,
      ...paymentEvents,
      ...allocationEvents,
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }
}
