import FinanceDashboard from "@/components/finance/FinanceDashboard";
import { getUserContext } from "@/lib/auth/getUserContext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";

import { GetTenantLedgerUseCase } from "@/lib/modules/finance/use-cases/get-tenant-ledger.usecase";

export default async function Page() {
  const context = await getUserContext();

  if (!context) return <div>No autorizado</div>;

  const supabase = await createSupabaseServerClient();

  const paymentRepo = new PaymentRepository(supabase);
  const debtRepo = new DebtRepository(supabase);
  const allocationRepo = new AllocationRepository(supabase);

  const data = await new GetTenantLedgerUseCase(
    paymentRepo,
    debtRepo,
    allocationRepo,
  ).execute({
    tenantId: context.tenantId,
  });

  // 🔹 Adaptador para reutilizar UI actual
  const ledger = {
    balance: data?.balance ?? 0,
    debts: [],
    payments: [],
  };

  return <FinanceDashboard role="JUNTA" ledger={ledger} timeline={[]} />;
}
