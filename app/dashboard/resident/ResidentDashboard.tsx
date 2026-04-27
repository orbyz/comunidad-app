"use client";

import { useEffect, useState } from "react";

export default function ResidentDashboard() {
  const [data, setData] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [financeRes, ledgerRes] = await Promise.all([
        fetch("/api/resident/dashboard"),
        fetch("/api/ledger"),
      ]);

      const financeData = await financeRes.json();
      const ledgerData = await ledgerRes.json();

      setData(financeData);
      setLedger(Array.isArray(ledgerData?.ledger) ? ledgerData.ledger : []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setData({ error: "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 🔄 LOADING
  if (loading) return <p className="p-6">Cargando...</p>;

  // ❌ ERROR
  if (data?.error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error cargando datos</p>
      </div>
    );
  }

  // ✅ UI
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{data.property?.name}</h1>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Deuda</p>
          <p className="text-xl font-semibold">{data.totalDebt} €</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Pagado</p>
          <p className="text-xl font-semibold">{data.totalPaid} €</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-xl font-semibold">{data.balance} €</p>
        </div>
      </div>

      {/* 🔥 ÚLTIMOS MOVIMIENTOS */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Últimos movimientos</h2>

        <div className="space-y-2">
          {ledger.slice(0, 3).map((l) => (
            <div
              key={l.id}
              className="flex justify-between text-sm border-b pb-2"
            >
              <div>
                <p>{l.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(l.created_at).toLocaleDateString()}
                </p>
              </div>

              <p className={l.amount > 0 ? "text-green-600" : "text-red-600"}>
                {l.amount > 0 ? "+" : ""}
                {l.amount} €
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
