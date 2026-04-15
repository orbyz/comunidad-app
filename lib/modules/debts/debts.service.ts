import { supabase } from "@/lib/db/supabase";

export async function createDebt(data: {
  property_id: string;
  amount: number;
  due_date: string;
}) {
  const { data: debt, error } = await supabase
    .from("debts")
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return debt;
}

export async function getDebtsByProperty(property_id: string) {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("property_id", property_id);

  if (error) throw new Error(error.message);

  return data;
}
