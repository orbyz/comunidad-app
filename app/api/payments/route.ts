import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { getUserProfile } from "@/lib/auth/getUserProfile";

// repo + use cases
import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { CreatePaymentUseCase } from "@/lib/modules/payments/use-cases/create-payment.usecase";
import { GetPaymentsUseCase } from "@/lib/modules/payments/use-cases/get-payments.usecase";

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    const repo = new PaymentRepository(supabase);
    const useCase = new GetPaymentsUseCase(repo);
    const { searchParams } = new URL(req.url);

    let filters: any = {};

    // status
    const status = searchParams.get("status");
    if (status) filters.status = status;

    // 🔥 CLAVE
    filters.tenant_id = profile.tenant_id;

    // residente
    if (profile.role === "RESIDENTE") {
      filters.user_id = profile.id;
    }

    // admin
    if (["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
      const propertyId = searchParams.get("property_id");
      if (propertyId) {
        filters.property_id = propertyId;
      }
    }

    const data = await useCase.execute(filters);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (profile.role !== "RESIDENTE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const supabase = await createSupabaseServerClient();

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("tenant_id")
      .eq("id", profile.property_id)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }

    if (property.tenant_id !== profile.tenant_id) {
      throw new Error("Invalid tenant relation");
    }

    // 🔹 obtener deuda actual de la propiedad
    const { data: debts } = await supabase
      .from("debts")
      .select("amount")
      .eq("property_id", profile.property_id);

    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("property_id", profile.property_id)
      .eq("status", "VERIFIED");

    const totalDebt = debts?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

    const totalPaid =
      payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const balance = totalDebt - totalPaid;

    // 🔥 VALIDACIONES
    if (balance <= 0) {
      return NextResponse.json(
        { error: "No tienes deuda pendiente" },
        { status: 400 },
      );
    }

    if (body.amount > balance) {
      return NextResponse.json(
        { error: `El monto excede la deuda (${balance} €)` },
        { status: 400 },
      );
    }

    // 🔒 evitar pagos duplicados PENDING
    const { data: existingPayments, error: existingError } = await supabase
      .from("payments")
      .select("id")
      .eq("property_id", profile.property_id)
      .eq("status", "PENDING")
      .limit(1);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingPayments && existingPayments.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes un pago pendiente por verificar" },
        { status: 400 },
      );
    }

    const repo = new PaymentRepository(supabase);
    const useCase = new CreatePaymentUseCase(repo);

    const payment = await useCase.execute({
      amount: body.amount,
      method: body.method,
      reference: body.reference,
      user_id: profile.id,
      property_id: profile.property_id,
      tenant_id: profile.tenant_id,
    });

    return NextResponse.json(payment);
  } catch (err: any) {
    console.error("PAYMENTS API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
