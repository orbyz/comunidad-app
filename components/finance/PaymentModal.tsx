"use client";

import { useState } from "react";
import { createPayment } from "@/lib/api/finance";

type Props = {
  open: boolean;
  onClose: () => void;
  unitId: string;
};

export default function PaymentModal({ open, onClose, unitId }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createPayment({
        unitId,
        amount: Number(amount),
        method: "TRANSFERENCIA",
      });

      onClose();
      location.reload(); // simple por ahora
    } catch (e) {
      alert("Error creando pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[400px] space-y-4">
        <h2 className="text-lg font-bold">Registrar pago</h2>

        <p className="text-sm text-gray-500">Propiedad: {unitId}</p>

        <input
          type="number"
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
