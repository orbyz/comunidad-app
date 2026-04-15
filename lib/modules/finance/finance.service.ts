import { supabase } from "@/lib/db/supabase";

export async function getPropertyBalance(property_id: string) {
  // 🔹 total deuda
  const { data: debts } = await supabase
    .from("debts")
    .select("amount")
    .eq("property_id", property_id);

  const totalDebt = debts?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  // 🔹 pagos verificados
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("property_id", property_id)
    .eq("status", "VERIFIED");

  const totalPaid =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return {
    totalDebt,
    totalPaid,
    balance: totalDebt - totalPaid,
  };
}
