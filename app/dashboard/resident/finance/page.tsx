import FinanceDashboard from "@/components/finance/FinanceDashboard";
import { getUserContext } from "@/lib/auth/getUserContext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { GetLedgerUseCase } from "@/lib/modules/finance/use-cases/get-ledger.usecase";
import { GetTimelineUseCase } from "@/lib/modules/finance/use-cases/get-timeline.usecase";
import { PaymentRepository } from "@/lib/modules/payments/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";
import { redirect } from "next/navigation";

export default async function Page() {
  const context = await getUserContext();

  if (!context?.tenantId) {
    redirect("/dashboard/resident");
  }

  const { tenantId, propertyId } = context;

  if (!propertyId) return <div>No tienes una propiedad asignada</div>;

  // ✅ Un solo cliente y repos compartidos entre ambos use cases
  const supabase = await createSupabaseServerClient();
  const paymentRepo = new PaymentRepository(supabase);
  const debtRepo = new DebtRepository(supabase);
  const allocationRepo = new AllocationRepository(supabase);

  const input = { tenantId, unitId: propertyId };

  // ✅ Ejecución en paralelo, sin HTTP, sin problema de cookies
  const [ledger, timeline] = await Promise.all([
    new GetLedgerUseCase(paymentRepo, debtRepo, allocationRepo).execute(input),
    new GetTimelineUseCase(paymentRepo, debtRepo, allocationRepo).execute(
      input,
    ),
  ]);

  return (
    <FinanceDashboard role="RESIDENTE" ledger={ledger} timeline={timeline} />
  );
}
