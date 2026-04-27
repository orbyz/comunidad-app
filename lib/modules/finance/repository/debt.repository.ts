import { SupabaseClient } from "@supabase/supabase-js";
import { Debt } from "../domain/types";
import { DebtStatus } from "../domain/enums";

export class DebtRepository {
  constructor(private db: SupabaseClient) {}

  // 🔹 NUEVO MÉTODO (AQUÍ dentro de la clase)
  async findByTenant(tenantId: string) {
    const { data, error } = await this.db
      .from("debts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`DebtRepository.findByTenant: ${error.message}`);
    }

    return (
      data?.map((d: any) => ({
        id: d.id,
        tenantId: d.tenant_id,
        unitId: d.property_id,
        amount: d.amount,
        paidAmount: d.paid_amount || 0,
        status: d.status,
        dueDate: new Date(d.due_date),
        createdAt: new Date(d.created_at),
      })) || []
    );
  }

  async findByUnit(unitId: string, tenantId: string) {
    const { data, error } = await this.db
      .from("debts")
      .select("*")
      .eq("property_id", unitId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`DebtRepository.findByUnit: ${error.message}`);
    }

    return (
      data?.map((d: any) => ({
        id: d.id,
        tenantId: d.tenant_id,
        unitId: d.property_id,
        amount: d.amount,
        paidAmount: d.paid_amount || 0,
        status: d.status,
        dueDate: new Date(d.due_date),
      })) || []
    );
  }

  // 🔹 Crear deuda
  async create(data: {
    tenantId: string;
    unitId: string;
    amount: number;
    concept: string;
    dueDate: Date;
  }): Promise<Debt> {
    const { data: result, error } = await this.db
      .from("debts")
      .insert({
        tenant_id: data.tenantId,
        property_id: data.unitId,
        amount: data.amount,
        paid_amount: 0,
        status: DebtStatus.PENDING,
        concept: data.concept,
        due_date: data.dueDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`DebtRepository.create: ${error.message}`);

    return this.mapToDomain(result);
  }

  async updatePaidAmount(
    id: string,
    tenantId: string,
    paidAmount: number,
    status: string,
  ): Promise<void> {
    const { error } = await this.db
      .from("debts")
      .update({
        paid_amount: paidAmount,
        status: status === "PAID" ? "PAID" : "PENDING", // 🔥 NO PARTIAL
      })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`DebtRepository.updatePaidAmount: ${error.message}`);
    }
  }
  // 🔹 Mapper
  private mapToDomain(row: any): Debt {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      unitId: row.property_id,
      amount: row.amount,
      paidAmount: row.paid_amount,
      status: row.status,
      dueDate: new Date(row.due_date),
    };
  }
}
