import { SupabaseClient } from "@supabase/supabase-js";

export type PaymentAllocation = {
  id: string;
  paymentId: string;
  debtId: string;
  amount: number;
  tenantId: string;
  createdAt: Date;
};

export class AllocationRepository {
  constructor(private db: SupabaseClient) {}

  // 🔹 Crear asignación
  async create(data: {
    paymentId: string;
    debtId: string;
    amount: number;
    tenantId: string;
  }): Promise<PaymentAllocation> {
    const { data: result, error } = await this.db
      .from("payment_allocations")
      .insert({
        payment_id: data.paymentId,
        debt_id: data.debtId,
        amount: data.amount,
        tenant_id: data.tenantId, // 🔥 CLAVE
      })
      .select()
      .single();

    if (error) {
      throw new Error(`AllocationRepository.create: ${error.message}`);
    }

    return this.mapToDomain(result);
  }

  // 🔹 Total asignado por pago
  async getTotalAllocated(paymentId: string): Promise<number> {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("amount")
      .eq("payment_id", paymentId);

    if (error) {
      throw new Error(
        `AllocationRepository.getTotalAllocated: ${error.message}`,
      );
    }

    return (data || []).reduce(
      (sum: number, row: any) => sum + Number(row.amount || 0),
      0,
    );
  }

  // 🔹 Allocations por pago
  async findByPayment(paymentId: string): Promise<PaymentAllocation[]> {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`AllocationRepository.findByPayment: ${error.message}`);
    }

    return (data || []).map(this.mapToDomain);
  }

  // 🔹 Allocations por tenant
  async findByTenant(tenantId: string): Promise<PaymentAllocation[]> {
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("*")
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`AllocationRepository.findByTenant: ${error.message}`);
    }

    return (data || []).map(this.mapToDomain);
  }

  // 🔹 Allocations por tenant + unidad (JOIN real)
  async findByTenantAndUnit(tenantId: string, unitId: string) {
    // 🔹 1. Obtener payments de esa unidad
    const { data: payments, error: paymentsError } = await this.db
      .from("payments")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("property_id", unitId);

    if (paymentsError) {
      throw new Error(paymentsError.message);
    }

    if (!payments || payments.length === 0) return [];

    const paymentIds = payments.map((p) => p.id);

    // 🔹 2. Obtener allocations relacionadas
    const { data, error } = await this.db
      .from("payment_allocations")
      .select("*")
      .in("payment_id", paymentIds);

    if (error) {
      throw new Error(
        `AllocationRepository.findByTenantAndUnit: ${error.message}`,
      );
    }

    return (data || []).map(this.mapToDomain);
  }

  // 🔹 Mapper consistente
  private mapToDomain = (row: any): PaymentAllocation => ({
    id: row.id,
    paymentId: row.payment_id,
    debtId: row.debt_id,
    amount: Number(row.amount || 0),
    tenantId: row.tenant_id,
    createdAt: new Date(row.created_at),
  });
}
