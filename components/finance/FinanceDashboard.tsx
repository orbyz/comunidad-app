"use client";

import BalanceCard from "./BalanceCard";
import SummaryCards from "./SummaryCards";
import TimelineList from "./TimelineList";

import { createDebt, createPayment } from "@/lib/api/finance";
import { useState } from "react";

export default function FinanceDashboard({ role, ledger, timeline }: any) {
  const [loading, setLoading] = useState(false);

  const handleCreateDebt = async () => {
    try {
      setLoading(true);

      await createDebt({
        unitId: ledger.debts?.[0]?.unitId || "TEST_ID",
        amount: 100,
        concept: "Cuota mensual",
        dueDate: new Date().toISOString(),
      });

      location.reload();
    } catch (e) {
      alert("Error creando deuda");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setLoading(true);

      await createPayment({
        unitId: ledger.debts?.[0]?.unitId || "TEST_ID",
        amount: 50,
        method: "TRANSFERENCIA",
      });

      location.reload();
    } catch (e) {
      alert("Error creando pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 Balance */}
      <BalanceCard balance={ledger.balance} />

      {/* 🔹 Resumen */}
      <SummaryCards ledger={ledger} />

      {/* 🔹 Timeline */}
      <TimelineList timeline={timeline} />

      {/* 🔐 Acciones */}
      {role === "ADMIN" && (
        <div className="flex gap-2">
          <button onClick={handleCreateDebt} disabled={loading}>
            Crear deuda
          </button>

          <button onClick={handleCreatePayment} disabled={loading}>
            Registrar pago
          </button>
        </div>
      )}
    </div>
  );
}
