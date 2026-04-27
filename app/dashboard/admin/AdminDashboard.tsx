"use client";

import { useEffect, useState } from "react";

type FinanceData = {
  totalDebt: number;
  totalPaid: number;
  balance: number;
};

export default function AdminDashboard() {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [data, setData] = useState<FinanceData | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      // 🔹 PROPERTIES
      const propertiesRes = await fetch("/api/properties");
      const propertiesData = await propertiesRes.json();

      setProperties(Array.isArray(propertiesData) ? propertiesData : []);

      if (!propertyId && propertiesData?.length > 0) {
        setPropertyId(propertiesData[0].id);
        return;
      }

      if (!propertyId) return;

      // 🔹 DATA PRINCIPAL
      const [financeRes, paymentsRes, debtsRes] = await Promise.all([
        fetch(`/api/dashboard/finance?property_id=${propertyId}`),
        fetch(`/api/payments?property_id=${propertyId}`),
        fetch(`/api/debts?property_id=${propertyId}`),
      ]);

      const financeData = await financeRes.json();
      const paymentsRaw = await paymentsRes.json();
      const debtsRaw = await debtsRes.json();

      // 🔥 NORMALIZACIÓN SEGURA
      const normalizedPayments = (
        Array.isArray(paymentsRaw)
          ? paymentsRaw
          : Array.isArray(paymentsRaw?.data)
            ? paymentsRaw.data
            : []
      ).map((p) => ({
        ...p,
        status: String(p.status).toUpperCase(),
      }));

      const normalizedDebts = Array.isArray(debtsRaw)
        ? debtsRaw
        : Array.isArray(debtsRaw?.data)
          ? debtsRaw.data
          : [];

      setPayments(normalizedPayments);
      setDebts(normalizedDebts);
      setData(financeData || null);
      console.log("PAYMENTS RAW:", paymentsRaw);
      console.log("NORMALIZED:", normalizedPayments);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);
      setPayments([]);
      setDebts([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (propertyId) {
      loadData();
    }
  }, [propertyId]);

  async function verifyPayment(id: string) {
    setLoading(true);

    await fetch(`/api/payments/${id}/verify`, {
      method: "PATCH",
    });

    await loadData();
    setLoading(false);
  }

  async function rejectPayment(id: string) {
    setLoading(true);

    await fetch(`/api/payments/${id}/reject`, {
      method: "PATCH",
    });

    await loadData();
    setLoading(false);
  }

  if (!data) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard Financiero</h1>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm">Propiedad:</label>

          <select
            value={propertyId ?? ""}
            onChange={(e) => setPropertyId(e.target.value)}
            className="border p-2 rounded"
          >
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={async () => {
            if (!propertyId) return;

            const res = await fetch("/api/admin/property-invites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ property_id: propertyId }),
            });

            const data = await res.json();

            if (res.ok) setGeneratedCode(data.code);
            else alert(data.error || "Error generando código");
          }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          Generar código
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Deuda total</p>
          <p className="text-xl font-bold">{data.totalDebt} €</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Pagos</p>
          <p className="text-xl font-bold">{data.totalPaid} €</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-xl font-bold">{data.balance} €</p>
        </div>
      </div>

      {/* PAGOS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Pagos</h2>

        <table className="w-full border rounded-xl">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Monto</th>
              <th className="p-2 text-left">Método</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="p-2 text-center text-gray-500">
                  No hay pagos
                </td>
              </tr>
            )}

            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.amount} €</td>
                <td className="p-2">{p.method}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2 space-x-2">
                  {p.status === "PENDING" && (
                    <>
                      <button
                        disabled={loading}
                        onClick={() => verifyPayment(p.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Verificar
                      </button>
                      <button
                        onClick={() => rejectPayment(p.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEUDAS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Deudas</h2>

        <table className="w-full border rounded-xl">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Monto</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {debts.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.amount} €</td>
                <td className="p-2">{d.due_date}</td>
                <td className="p-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
