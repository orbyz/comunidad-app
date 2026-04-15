"use client";

import { useState } from "react";
import PaymentModal from "./PaymentModal";

type Property = {
  unitId: string;
  totalDebt: number;
  totalPaid: number;
  pending: number;
  status: "PENDING" | "PARTIAL" | "PAID";
};

type Props = {
  data: {
    properties: Property[];
    totalDebt: number;
    totalPaid: number;
    balance: number;
  };
};

export default function FinanceDashboardAdmin({ data }: Props) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PARTIAL" | "PAID">(
    "ALL",
  );
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // 🔹 Filtrado correcto (FUERA del map)
  const filtered = data.properties.filter((p) => {
    if (filter === "PENDING") return p.status === "PENDING";
    if (filter === "PAID") return p.status === "PAID";
    if (filter === "PARTIAL") return p.status === "PARTIAL";
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* 🔹 KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-xl font-bold">€ {data.balance}</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Total deuda</p>
          <p className="text-xl font-bold">€ {data.totalDebt}</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Total pagado</p>
          <p className="text-xl font-bold">€ {data.totalPaid}</p>
        </div>
      </div>

      {/* 🔹 Filtros */}
      <div className="flex gap-2">
        {["ALL", "PENDING", "PARTIAL", "PAID"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔹 Tabla */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Propiedad</th>
              <th className="p-3">Deuda</th>
              <th className="p-3">Pagado</th>
              <th className="p-3">Pendiente</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.unitId} className="border-t">
                {/* Propiedad */}
                <td className="p-3">{p.unitId}</td>

                {/* Valores */}
                <td className="p-3 text-center">€ {p.totalDebt}</td>
                <td className="p-3 text-center">€ {p.totalPaid}</td>
                <td className="p-3 text-center">€ {p.pending}</td>

                {/* Estado */}
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : p.status === "PARTIAL"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-3 text-center space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => alert(`Ver detalle ${p.unitId}`)}
                  >
                    Ver
                  </button>

                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => setSelectedUnit(p.unitId)}
                  >
                    Pagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaymentModal
        open={!!selectedUnit}
        unitId={selectedUnit || ""}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  );
}
