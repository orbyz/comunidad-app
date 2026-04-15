import { SupabaseClient } from "@supabase/supabase-js";
import { Payment } from "../domain/types";
import { PaymentStatus } from "../domain/enums";

export class PaymentRepository {
  constructor(private db: SupabaseClient) {}

  // 🔹 Crear pago
  async create(data: {
    tenantId: string;
    unitId: string; // property_id
    amount: number;
    method: string;
    reference?: string;
  }): Promise<Payment> {
    const { data: result, error } = await this.db
      .from("payments")
      .insert({
        tenant_id: data.tenantId,
        property_id: data.unitId,
        amount: data.amount,
        method: data.method,
        reference: data.reference ?? null,
        status: PaymentStatus.PENDING,
      })
      .select()
      .single();

    if (error) throw new Error(`PaymentRepository.create: ${error.message}`);

    return this.mapToDomain(result);
  }

  // 🔹 Obtener por ID (multi-tenant seguro)
  async findById(id: string, tenantId: string): Promise<Payment | null> {
    const { data, error } = await this.db
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw new Error(`PaymentRepository.findById: ${error.message}`);
    if (!data) return null;

    return this.mapToDomain(data);
  }

  // 🔹 Listar por propiedad
  async findByUnit(unitId: string, tenantId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from("payments")
      .select("*")
      .eq("property_id", unitId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error)
      throw new Error(`PaymentRepository.findByUnit: ${error.message}`);

    return data.map((row) => this.mapToDomain(row));
  }

  async findByTenant(tenantId: string) {
    const { data, error } = await this.db
      .from("payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`PaymentRepository.findByTenant: ${error.message}`);
    }

    return (
      data?.map((p: any) => ({
        id: p.id,
        tenantId: p.tenant_id,
        unitId: p.property_id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        createdAt: new Date(p.created_at),
      })) || []
    );
  }

  // 🔹 Actualizar estado
  async updateStatus(
    id: string,
    tenantId: string,
    status: PaymentStatus,
  ): Promise<void> {
    const { error } = await this.db
      .from("payments")
      .update({ status })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error)
      throw new Error(`PaymentRepository.updateStatus: ${error.message}`);
  }

  // 🔹 Mapper DB → Dominio
  private mapToDomain(row: any): Payment {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      unitId: row.property_id,
      amount: row.amount,
      method: row.method,
      status: row.status,
      reference: row.reference ?? undefined,
      createdAt: new Date(row.created_at),
    };
  }
}
