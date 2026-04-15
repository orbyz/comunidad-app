import { SupabaseClient } from "@supabase/supabase-js";

export type PaymentAllocation = {
  id: string;
  paymentId: string;
  debtId: string;
  amount: number;
  createdAt: Date;
};

export class AllocationRepository {
  constructor(private db: SupabaseClient) {}

  // 🔹 Crear asignación
  async create(data: {
    paymentId: string;
    debtId: string;
    amount: number;
  }): Promise<PaymentAllocation> {
    const { data: result, error } = await this.db
      .from("payment_allocations")
      .insert({
        payment_id: data.paymentId,
        debt_id: data.debtId,
        amount: data.amount,
      })
      .select()
      .single();

    if (error) throw new Error(`AllocationRepository.create: ${error.message}`);

    return this.mapToDomain(result);
  }

  // 🔹 Obtener total usado de un payment
  async getTotalAllocated(paymentId: string): Promise<number> {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("amount")
      .eq("payment_id", paymentId);

    if (error)
      throw new Error(
        `AllocationRepository.getTotalAllocated: ${error.message}`,
      );

    return data.reduce((sum, row) => sum + row.amount, 0);
  }

  // 🔹 Obtener allocations por payment
  async findByPayment(paymentId: string) {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`AllocationRepository.findByPayment: ${error.message}`);
    }

    return data.map((row) => this.mapToDomain(row));
  }

  async findByTenantAndUnit(tenantId: string, unitId: string) {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select(
        `
        id,
        payment_id,
        debt_id,
        amount,
        created_at,
        debts!inner(property_id)
      `,
      )
      .eq("tenant_id", tenantId)
      .eq("debts.property_id", unitId);

    if (error) {
      console.error("ALLOCATION ERROR:", error);
      throw new Error(error.message);
    }

    return (
      data?.map((a: any) => ({
        id: a.id,
        paymentId: a.payment_id,
        debtId: a.debt_id,
        amount: a.amount,
        createdAt: new Date(a.created_at),
      })) || []
    );
  }

  async findByTenant(tenantId: string) {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("*")
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`AllocationRepository.findByTenant: ${error.message}`);
    }

    if (!data || !Array.isArray(data)) return [];

    const safeData = data.filter(
      (a: any) =>
        a &&
        typeof a === "object" &&
        a.id &&
        a.debt_id &&
        a.amount !== undefined,
    );

    return safeData.map((a: any) => ({
      id: a.id,
      paymentId: a.payment_id,
      debtId: a.debt_id,
      amount: Number(a.amount ?? 0),
      createdAt: new Date(a.created_at),
    }));
  }

  // 🔹 Mapper
  // 🔹 Mapper
  private mapToDomain(row: any): PaymentAllocation {
    return {
      id: row.id,
      paymentId: row.payment_id,
      debtId: row.debt_id,
      amount: row.amount,
      createdAt: new Date(row.created_at),
    };
  }
}
