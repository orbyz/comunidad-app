import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/auth/getUserProfile";

export async function GET() {
  try {
    // 🔐 Perfil completo (source of truth)
    const profile = await getUserProfile();

    console.log("PROFILE DASHBOARD:", profile);

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!profile.property_id) {
      return NextResponse.json(
        { error: "No property assigned" },
        { status: 400 },
      );
    }

    // 🔥 usar MISMO cliente SSR (respeta RLS)
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const propertyId = profile.property_id;

    // 🔹 propiedad
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;

    // 🔹 deudas
    const { data: debts } = await supabase
      .from("debts")
      .select("amount")
      .eq("property_id", propertyId);

    const totalDebt = debts?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

    // 🔹 pagos
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("property_id", propertyId)
      .eq("status", "VERIFIED");

    const totalPaid =
      payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    return NextResponse.json({
      property,
      totalDebt,
      totalPaid,
      balance: totalDebt - totalPaid,
    });
  } catch (err: any) {
    console.error("Resident dashboard error:", err);

    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
