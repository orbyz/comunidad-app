import FinanceDashboard from "@/components/finance/FinanceDashboard";
import { getUserContext } from "@/lib/auth/getUserContext";

export default async function Page() {
  const context = await getUserContext();

  const { ledger, timeline } = await fetchData(context);

  return <FinanceDashboard role="JUNTA" ledger={ledger} timeline={timeline} />;
}
