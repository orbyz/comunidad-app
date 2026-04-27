import { PaymentRepository } from "../repository/payment.repository";

type Filters = {
  tenant_id: string;
  property_id?: string;
  user_id?: string;
  status?: string;
};

export class GetPaymentsUseCase {
  constructor(private repo: PaymentRepository) {}

  async execute(filters: Filters) {
    const { tenant_id, property_id, user_id, status } = filters;

    let payments: any[] = [];

    // 🔹 Prioridad 1: propiedad (admin o filtros explícitos)
    if (property_id) {
      payments = await this.repo.findByUnit(property_id, tenant_id);
    }
    // 🔹 Prioridad 2: usuario (residente)
    else if (user_id) {
      // ⚠️ solo si tienes este método
      if (this.repo.findByUser) {
        payments = await this.repo.findByUser(user_id, tenant_id);
      } else {
        // fallback seguro
        payments = await this.repo.findByTenant(tenant_id);
        payments = payments.filter((p) => p.user_id === user_id);
      }
    }
    // 🔹 fallback: tenant completo
    else {
      payments = await this.repo.findByTenant(tenant_id);
    }

    // 🔹 filtro opcional por status
    if (status) {
      payments = payments.filter(
        (p) => String(p.status).toUpperCase() === status.toUpperCase(),
      );
    }

    return payments;
  }
}
