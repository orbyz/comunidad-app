import FinanceDashboard from "@/components/finance/FinanceDashboard";
import { getUserContext } from "@/lib/auth/getUserContext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { GetLedgerUseCase } from "@/lib/modules/finance/use-cases/get-ledger.usecase";
import { GetTimelineUseCase } from "@/lib/modules/finance/use-cases/get-timeline.usecase";
import { PaymentRepository } from "@/lib/modules/finance/repository/payment.repository";
import { DebtRepository } from "@/lib/modules/finance/repository/debt.repository";
import { AllocationRepository } from "@/lib/modules/finance/repository/allocation.repository";

export default async function Page() {
  const context = await getUserContext();

  if (!context) return <div>No autorizado</div>;

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
  // console.log("🔥 PAGE FINANCE EJECUTANDO");
  // console.log("CONTEXT:", context);
  //  console.log("LEDGER:", JSON.stringify(ledger, null, 2));
  // console.log("TIMELINE:", JSON.stringify(timeline, null, 2));

  return (
    <FinanceDashboard role="RESIDENTE" ledger={ledger} timeline={timeline} />
  );
}
