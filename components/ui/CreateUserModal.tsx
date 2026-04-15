"use client";

import { useState } from "react";
import { Button } from "./Button";

export default function CreateUserModal({
  open,
  onClose,
  onCreate,
  properties,
}: any) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    property_id: "",
    type: "OWNER",
    is_payer: true,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-[500px] space-y-4">
        <h2 className="font-semibold">Crear usuario</h2>

        {/* DATOS */}
        <input
          placeholder="Nombre"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Apellido"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 w-full rounded"
        />

        {/* PROPIEDAD */}
        <select
          value={form.property_id}
          onChange={(e) => setForm({ ...form, property_id: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">Seleccionar propiedad</option>
          {properties.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* TIPO */}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="OWNER">Propietario</option>
          <option value="TENANT">Inquilino</option>
        </select>

        {/* PAGADOR */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_payer}
            onChange={(e) => setForm({ ...form, is_payer: e.target.checked })}
          />
          Responsable de pago
        </label>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            onClick={() => {
              onCreate(form);
            }}
          >
            Crear
          </Button>
        </div>
      </div>
    </div>
  );
}
