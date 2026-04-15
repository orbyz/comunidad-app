import { SupabaseClient } from "@supabase/supabase-js";
import { Debt } from "../domain/types";
import { DebtStatus } from "../domain/enums";

export class DebtRepository {
  constructor(private db: SupabaseClient) {}

  // 🔹 Crear deuda
  async create(data: {
    tenantId: string;
    unitId: string; // property_id
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

  // 🔹 Obtener por ID (multi-tenant seguro)
  async findById(id: string, tenantId: string): Promise<Debt | null> {
    const { data, error } = await this.db
      .from("debts")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw new Error(`DebtRepository.findById: ${error.message}`);
    if (!data) return null;

    return this.mapToDomain(data);
  }

  // 🔹 Listar deudas por propiedad
  async findByUnit(unitId: string, tenantId: string): Promise<Debt[]> {
    const { data, error } = await this.db
      .from("debts")
      .select("*")
      .eq("property_id", unitId)
      .eq("tenant_id", tenantId)
      .order("due_date", { ascending: true });

    if (error) throw new Error(`DebtRepository.findByUnit: ${error.message}`);

    return data.map((row) => this.mapToDomain(row));
  }

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
      })) || []
    );
  }

  // 🔹 Actualizar pagos acumulados (clave para ERP)
  async updatePaidAmount(
    id: string,
    tenantId: string,
    paidAmount: number,
    status: DebtStatus,
  ): Promise<void> {
    const { error } = await this.db
      .from("debts")
      .update({
        paid_amount: paidAmount,
        status,
      })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error)
      throw new Error(`DebtRepository.updatePaidAmount: ${error.message}`);
  }

  // 🔹 Mapper DB → Dominio
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
