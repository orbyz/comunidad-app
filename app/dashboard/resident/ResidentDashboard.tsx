"use client";

import { useEffect, useState } from "react";
import JoinPropertyModal from "@/components/ui/JoinPropertyModal";

export default function ResidentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openJoin, setOpenJoin] = useState(false);

  useEffect(() => {
    fetch("/api/resident/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch(() => {
        setData({ error: "Unexpected error" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔄 LOADING
  if (loading) {
    return <p className="p-6">Cargando...</p>;
  }

  // ⚠️ SIN PROPIEDAD (UX PRO)
  if (data?.error === "No property assigned") {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="border rounded-2xl p-8 bg-yellow-50 max-w-md w-full text-center space-y-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            Aún no perteneces a una comunidad
          </h2>

          <p className="text-sm text-gray-600">
            Puedes solicitar acceso a tu administrador o unirte con un código de
            invitación.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => alert("Función próximamente")}
              className="bg-black text-white py-2 rounded-lg"
            >
              Solicitar acceso
            </button>
            <button
              onClick={() => setOpenJoin(true)}
              className="border py-2 rounded-lg"
            >
              Tengo un código
            </button>
            <JoinPropertyModal
              open={openJoin}
              onClose={() => setOpenJoin(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // ❌ ERROR GENÉRICO
  if (data?.error) {
    return (
      <div className="p-6">
        <div className="border rounded-xl p-6 bg-red-50">
          <h2 className="font-semibold text-red-700">Error cargando datos</h2>

          <p className="text-sm text-gray-600 mt-1">
            Inténtalo nuevamente más tarde.
          </p>
        </div>
      </div>
    );
  }

  // ✅ OK
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{data.property.name}</h1>

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
    </div>
  );
}
