import { NextRequest, NextResponse } from "next/server";
import { GetTimelineUseCase } from "@/lib/modules/finance/use-cases/get-timeline.usecase";
import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { getUserContext } from "@/lib/auth/getUserContext";

export async function GET(req: NextRequest) {
  try {
    const context = await getUserContext();

    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId, role, propertyId } = context;

    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");

    // 🔐 RBAC
    if (role === "RESIDENTE" && unitId !== propertyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();

    const paymentRepo = new PaymentRepository(supabase);
    const debtRepo = new DebtRepository(supabase);
    const allocationRepo = new AllocationRepository(supabase);

    const useCase = new GetTimelineUseCase(
      paymentRepo,
      debtRepo,
      allocationRepo,
    );

    const timeline = await useCase.execute({
      tenantId,
      unitId: unitId!,
    });

    return NextResponse.json(timeline);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 400 },
    );
  }
}
