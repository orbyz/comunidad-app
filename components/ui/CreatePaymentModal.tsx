"use client";

import { useState } from "react";
import { Button } from "./Button";

export default function CreatePaymentModal({ open, onClose, onCreate }: any) {
  const [form, setForm] = useState({
    amount: "",
    method: "TRANSFERENCIA",
    reference: "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-[400px] space-y-4">
        <h2 className="font-semibold">Registrar pago</h2>

        <input
          type="number"
          placeholder="Monto"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="PAGOMOVIL">Pago móvil</option>
          <option value="EFECTIVO">Efectivo</option>
        </select>

        <input
          placeholder="Referencia"
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            onClick={() =>
              onCreate({
                amount: Number(form.amount),
                method: form.method,
                reference: form.reference,
              })
            }
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
