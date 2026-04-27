"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/lib/toast";

type Payment = {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference?: string;
  created_at: string;
  user_id?: string;

  // 🔥 NUEVO
  users?: {
    email?: string;
  };

  properties?: {
    name?: string;
  };
};

export default function AdminPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    const url = statusFilter
      ? `/api/payments?status=${statusFilter}`
      : "/api/payments";

    const res = await fetch(url);
    const data = await res.json();

    console.log("PAYMENTS RESPONSE:", data); // 👈 AÑADE ESTO

    if (Array.isArray(data)) {
      setPayments(data);
    } else {
      setPayments([]); // evita crash
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function updateStatus(id: string, action: "verify" | "reject") {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/payments/${id}/${action}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error("Error al actualizar");

      showSuccess(action === "verify" ? "Pago verificado" : "Pago rechazado");

      await load();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  function statusBadge(status: string) {
    const base = "text-xs px-2 py-1 rounded font-semibold";

    switch (status) {
      case "PENDING":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "VERIFIED":
        return `${base} bg-green-100 text-green-700`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-700`;
      default:
        return base;
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-heading">Pagos</h1>

      {/* 🔍 FILTRO */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="VERIFIED">Verificados</option>
          <option value="REJECTED">Rechazados</option>
        </select>

        <Button onClick={load}>Filtrar</Button>
      </div>

      <div className="grid gap-3">
        {payments.map((p) => (
          <Card key={p.id}>
            <div className="flex justify-between items-center">
              {/* IZQUIERDA */}
              <div className="space-y-1">
                <p className="font-medium">
                  €{p.amount} — {p.method}
                </p>

                <p className="text-xs text-muted-foreground">
                  Ref: {p.reference || "N/A"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </p>

                {/* 🔥 NUEVO */}
                <p className="text-xs text-muted-foreground">
                  👤 {p.users?.email || "N/A"}
                </p>

                <p className="text-xs text-muted-foreground">
                  🏠 {p.properties?.name || "N/A"}
                </p>

                <span className={statusBadge(p.status)}>{p.status}</span>
              </div>

              {/* DERECHA */}
              <div className="flex gap-2">
                {p.status === "PENDING" && (
                  <>
                    <Button
                      disabled={loadingId === p.id}
                      onClick={() => updateStatus(p.id, "verify")}
                    >
                      Verificar
                    </Button>

                    <Button
                      variant="danger"
                      disabled={loadingId === p.id}
                      onClick={() => updateStatus(p.id, "reject")}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
