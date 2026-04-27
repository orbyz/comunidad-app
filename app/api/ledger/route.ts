import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";

import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { GetLedgerUseCase } from "@/lib/modules/finance/use-cases/get-ledger.usecase";

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!profile.tenant_id || !profile.property_id) {
      return NextResponse.json(
        { error: "User missing tenant/property" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const paymentRepo = new PaymentRepository(supabase);
    const debtRepo = new DebtRepository(supabase);
    const allocationRepo = new AllocationRepository(supabase);

    const useCase = new GetLedgerUseCase(paymentRepo, debtRepo, allocationRepo);

    const data = await useCase.execute({
      tenantId: profile.tenant_id,
      unitId: profile.property_id, // 🔥 ESTE ES EL FIX REAL
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("LEDGER API ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
