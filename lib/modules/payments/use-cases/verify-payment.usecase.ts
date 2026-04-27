import { PaymentRepository } from "../repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";
import { allocatePayment } from "@/lib/modules/finance/services/allocate-payment.service";

export class VerifyPaymentUseCase {
  constructor(
    private paymentRepo: PaymentRepository,
    private debtRepo: DebtRepository,
    private allocationRepo: AllocationRepository,
  ) {}

  async execute(params: {
    paymentId: string;
    tenantId: string;
    unitId: string;
    verifiedBy?: string;
  }) {
    const { paymentId, tenantId, unitId, verifiedBy } = params;

    const payment = await this.paymentRepo.findById(paymentId, tenantId);

    if (!payment) throw new Error("Payment not found");

    if (payment.status === "VERIFIED") {
      throw new Error("Payment already verified");
    }

    // 🔹 1. Verificar pago
    await this.paymentRepo.updateStatus(paymentId, tenantId, "VERIFIED", {
      verifiedBy,
    });

    // 🔹 2. Aplicar pago a deudas
    await allocatePayment({
      paymentId,
      tenantId,
      unitId,
      paymentRepo: this.paymentRepo,
      debtRepo: this.debtRepo,
      allocationRepo: this.allocationRepo,
    });

    return { success: true };
  }
}
