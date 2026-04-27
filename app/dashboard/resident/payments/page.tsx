"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import CreatePaymentModal from "@/components/ui/CreatePaymentModal";
import { showSuccess, showError } from "@/lib/toast";

type LedgerEntry = {
  id: string;
  type: "DEBT" | "PAYMENT" | "ALLOCATION";
  amount: number;
  description: string;
  created_at: string;
};

type FinanceData = {
  balance: number;
  totalDebt: number;
  totalPaid: number;
};

export default function ResidentPaymentsPage() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 LOAD DATA
  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch("/api/ledger");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error cargando datos");

      setLedger(Array.isArray(data.ledger) ? data.ledger : []);

      setFinance({
        balance: data.balance ?? 0,
        totalDebt: data.totalDebt ?? 0,
        totalPaid: data.totalPaid ?? 0,
      });
    } catch (err: any) {
      console.error("LOAD LEDGER ERROR:", err);
      showError(err.message);
      setLedger([]);
      setFinance({
        balance: 0,
        totalDebt: 0,
        totalPaid: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 CREATE PAYMENT
  async function handleCreate(formData: any) {
    try {
      setCreating(true);

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      showSuccess("Pago registrado correctamente");

      setOpenModal(false);
      await loadData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // 🔹 UI HELPERS
  function amountStyle(amount: number) {
    return amount > 0
      ? "text-green-600 font-semibold"
      : "text-red-600 font-semibold";
  }

  function typeLabel(type: LedgerEntry["type"]) {
    switch (type) {
      case "PAYMENT":
        return "Pago";
      case "DEBT":
        return "Deuda";
      case "ALLOCATION":
        return "Aplicación";
      default:
        return type;
    }
  }

  // 🔹 LOADING STATE
  if (loading || !finance) {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-heading">Mis pagos</h1>

      {/* 🔥 KPI */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-xl font-bold">€ {finance.balance}</p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Deuda</p>
          <p className="text-xl font-bold">€ {finance.totalDebt}</p>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Pagado</p>
          <p className="text-xl font-bold">€ {finance.totalPaid}</p>
        </Card>
      </div>

      {/* 🔥 CREAR PAGO */}
      <Card>
        <div className="flex justify-between items-center">
          <p className="font-medium">Registrar pago</p>

          <Button
            onClick={() => setOpenModal(true)}
            disabled={finance.balance <= 0 || creating}
          >
            Nuevo pago
          </Button>
        </div>

        {finance.balance <= 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            No tienes deuda pendiente
          </p>
        )}
      </Card>

      {/* 🔥 LEDGER */}
      <Card>
        <h2 className="font-semibold mb-3">Movimientos</h2>

        {ledger.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay movimientos</p>
        )}

        <div className="space-y-3">
          {ledger.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {typeLabel(l.type)} — {l.description}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(l.created_at).toLocaleString()}
                </p>
              </div>

              <p className={amountStyle(l.amount)}>
                {l.amount > 0 ? "+" : ""}
                {l.amount} €
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 🔥 MODAL */}
      <CreatePaymentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
