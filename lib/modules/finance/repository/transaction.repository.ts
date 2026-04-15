import { SupabaseClient } from "@supabase/supabase-js";

export class TransactionRepository {
  constructor(private db: SupabaseClient) {}

  async assignPayment(params: {
    paymentId: string;
    debtId: string;
    tenantId: string;
  }): Promise<void> {
    const { error } = await this.db.rpc("assign_payment", {
      p_payment_id: params.paymentId,
      p_debt_id: params.debtId,
      p_amount: 0, // se calcula en SQL
      p_tenant_id: params.tenantId,
    });

    if (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }
}
