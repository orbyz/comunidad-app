import { supabase } from "@/lib/db/supabase";

export async function allocatePayment(paymentId: string) {
  // 🔹 Obtener pago
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (!payment) throw new Error("Payment not found");

  let remaining = Number(payment.amount);

  // 🔹 Obtener deudas pendientes (ordenadas)
  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("property_id", payment.property_id)
    .eq("status", "PENDING")
    .order("due_date", { ascending: true });

  for (const debt of debts || []) {
    if (remaining <= 0) break;

    const debtAmount = Number(debt.amount);

    const applied = Math.min(remaining, debtAmount);

    // 🔹 Registrar asignación
    const { error } = await supabase.from("payment_allocations").insert([
      {
        payment_id: payment.id,
        debt_id: debt.id,
        amount: applied,
      },
    ]);

    if (error) {
      console.error("❌ Allocation insert error:", error);
      throw new Error(error.message);
    }

    remaining -= applied;
    console.log("➡️ Inserting allocation:", {
      payment_id: payment.id,
      debt_id: debt.id,
      amount: applied,
    });

    // 🔹 Si se paga completamente → marcar deuda como PAID
    if (applied >= debtAmount) {
      await supabase.from("debts").update({ status: "PAID" }).eq("id", debt.id);
    }
  }
}
