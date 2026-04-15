"use client";

import { useState } from "react";

export default function JoinPropertyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleJoin = async () => {
    if (!code) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/join-property", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }

      location.reload(); // 🔥 simple y efectivo
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
        <h2 className="font-semibold">Unirse a comunidad</h2>

        <input
          placeholder="Código de acceso"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>

          <button
            onClick={handleJoin}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Uniendo..." : "Unirme"}
          </button>
        </div>
      </div>
    </div>
  );
}
