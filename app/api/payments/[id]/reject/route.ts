import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { RejectPaymentUseCase } from "@/lib/modules/payments/use-cases/reject-payment.usecase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getUserProfile();

    // 🔒 AUTH
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 RBAC
    if (!["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    // 🔍 1. Obtener payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id, tenant_id, status")
      .eq("id", id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 🔒 2. Validar tenant
    if (payment.tenant_id !== profile.tenant_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔒 3. Evitar doble procesamiento
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este pago ya fue procesado" },
        { status: 400 },
      );
    }

    // 🧠 4. Ejecutar lógica
    const repo = new PaymentRepository(supabase);
    const useCase = new RejectPaymentUseCase(repo);

    const updated = await useCase.execute(id, {
      rejected_by: profile.id,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("REJECT PAYMENT ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
