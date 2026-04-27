import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth/getUserContext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";

import FinanceDashboardAdmin from "@/components/finance/FinanceDashboardAdmin";

import { GetTenantLedgerUseCase } from "@/lib/modules/finance/use-cases/get-tenant-ledger.usecase";

export default async function Page() {
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  // 🔐 RBAC PROTECCIÓN
  if (!["ADMIN", "SUPER_ADMIN", "JUNTA"].includes(context.role)) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const paymentRepo = new PaymentRepository(supabase);
  const debtRepo = new DebtRepository(supabase);
  const allocationRepo = new AllocationRepository(supabase);

  // ⚠️ TEMPORAL → usando tenant ledger (más adelante harás global)
  const data = await new GetTenantLedgerUseCase(
    paymentRepo,
    debtRepo,
    allocationRepo,
  ).execute({
    tenantId: context.tenantId,
  });

  return <FinanceDashboardAdmin data={data} />;
}
