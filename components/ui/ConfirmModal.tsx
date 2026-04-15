"use client";

import { Button } from "./Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  loading,
}: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-96 space-y-4">
        <h2 className="font-semibold">{title}</h2>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
