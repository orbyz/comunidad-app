import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("property_id");

  let debtQuery = supabase.from("debts").select("amount");
  let paymentQuery = supabase
    .from("payments")
    .select("amount")
    .eq("status", "VERIFIED");

  if (propertyId) {
    debtQuery = debtQuery.eq("property_id", propertyId);
    paymentQuery = paymentQuery.eq("property_id", propertyId);
  }

  const { data: debts } = await debtQuery;
  const { data: payments } = await paymentQuery;

  const totalDebt = debts?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const totalPaid =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return Response.json({
    totalDebt,
    totalPaid,
    balance: totalDebt - totalPaid,
  });
}
