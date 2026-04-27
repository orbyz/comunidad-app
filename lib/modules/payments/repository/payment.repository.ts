import { SupabaseClient } from "@supabase/supabase-js";

export class PaymentRepository {
  constructor(private db: SupabaseClient) {}

  async create(data: any) {
    const { data: payment, error } = await this.db
      .from("payments")
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return payment;
  }

  async findByUnit(unitId: string, tenantId: string) {
    const { data, error } = await this.db
      .from("payments")
      .select("*")
      .eq("property_id", unitId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data;
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
        reference: p.reference ?? undefined,
        createdAt: new Date(p.created_at),
      })) || []
    );
  }

  async findById(id: string, tenantId: string) {
    const { data, error } = await this.db
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) {
      throw new Error(`PaymentRepository.findById: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      unitId: data.property_id,
      amount: Number(data.amount),
      method: data.method,
      status: data.status,
      reference: data.reference ?? undefined,
      createdAt: new Date(data.created_at),
      verifiedAt: data.verified_at ? new Date(data.verified_at) : null,
      verifiedBy: data.verified_by ?? null,
    };
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: string,
    meta?: {
      verifiedBy?: string;
    },
  ) {
    const updateData: any = {
      status,
    };

    // 🔥 SOLO si es VERIFIED, añadimos metadata
    if (status === "VERIFIED") {
      updateData.verified_at = new Date().toISOString();

      if (meta?.verifiedBy) {
        updateData.verified_by = meta.verifiedBy;
      }
    }

    const { data, error } = await this.db
      .from("payments")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("status", "PENDING")
      .select()
      .maybeSingle(); // 🔥 IMPORTANTE

    if (error) {
      throw new Error(`PaymentRepository.updateStatus: ${error.message}`);
    }

    if (!data) {
      throw new Error("Payment not found or not updated");
    }

    return data;
  }
}
