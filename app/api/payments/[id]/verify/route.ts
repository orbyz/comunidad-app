import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";
import { VerifyPaymentUseCase } from "@/lib/modules/payments/use-cases/verify-payment.usecase";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paymentId } = await context.params;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 Solo admin puede verificar
    if (!["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();

    const paymentRepo = new PaymentRepository(supabase);
    const debtRepo = new DebtRepository(supabase);
    const allocationRepo = new AllocationRepository(supabase);

    // 🔥 🔥 CLAVE: obtener el pago primero
    const payment = await paymentRepo.findById(paymentId, profile.tenant_id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const useCase = new VerifyPaymentUseCase(
      paymentRepo,
      debtRepo,
      allocationRepo,
    );

    const result = await useCase.execute({
      paymentId,
      tenantId: profile.tenant_id,
      unitId: payment.unitId, // 🔥 FIX REAL AQUÍ
      verifiedBy: profile.id,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("VERIFY PAYMENT ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
