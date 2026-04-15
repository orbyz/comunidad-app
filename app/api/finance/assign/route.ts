import { NextRequest, NextResponse } from "next/server";
import { AssignPaymentToDebtUseCase } from "@/lib/modules/finance/use-cases/assign-payment.usecase";
import { PaymentRepository } from "@/lib/modules/finance/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer"; // ✅ CORRECTO
import { getUserContext } from "@/lib/auth/getUserContext";
import { TransactionRepository } from "@/lib/modules/finance/repository/transaction.repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const context = await getUserContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, role } = context;

    // 🔐 Solo ADMIN puede asignar pagos
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔥 IMPORTANTE
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant required" }, { status: 400 });
    }

    // ✅ Cliente correcto (SSR)
    const supabase = await createSupabaseServerClient();

    const txRepo = new TransactionRepository(supabase);

    const useCase = new AssignPaymentToDebtUseCase(txRepo);

    await useCase.execute({
      paymentId: body.paymentId,
      debtId: body.debtId,
      tenantId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 400 },
    );
  }
}
