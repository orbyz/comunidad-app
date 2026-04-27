type Input = {
  paymentId: string;
  tenantId: string;
  unitId: string;
  paymentRepo: any;
  debtRepo: any;
  allocationRepo: any;
};

export async function allocatePayment({
  paymentId,
  tenantId,
  unitId,
  paymentRepo,
  debtRepo,
  allocationRepo,
}: Input) {
  // 🔹 1. Obtener pago
  const payment = await paymentRepo.findById(paymentId, tenantId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  let remaining = payment.amount;

  // 🔹 2. Obtener deudas pendientes ordenadas (FIFO)
  const debts = await debtRepo.findByUnit(unitId, tenantId);

  for (const debt of debts) {
    if (remaining <= 0) break;

    const paid = debt.paidAmount || 0;
    const pending = debt.amount - paid;

    if (pending <= 0) continue;

    const applied = Math.min(remaining, pending);

    // 🔹 3. Crear allocation
    await allocationRepo.create({
      paymentId,
      debtId: debt.id,
      amount: applied,
      tenantId,
    });

    // 🔹 4. Actualizar deuda
    const newPaid = paid + applied;

    let status: "PENDING" | "PARTIAL" | "PAID" = "PENDING";

    if (newPaid >= debt.amount) status = "PAID";
    else if (newPaid > 0) status = "PARTIAL";

    await debtRepo.updatePaidAmount(debt.id, tenantId, newPaid, status);

    remaining -= applied;
  }
  console.log("ALLOCATING PAYMENT:", {
    paymentId,
    tenantId,
    unitId,
  });
}
