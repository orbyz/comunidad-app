"use client";

import { useState } from "react";

export default function IncidentActions({
  incident,
  onUpdate,
}: {
  incident: any;
  onUpdate: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.error("Error actualizando estado");
        return;
      }

      // 🔥 SIEMPRE sincroniza
      const updated = await res.json();
      await onUpdate();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      {incident.status !== "IN_PROGRESS" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("IN_PROGRESS")}
          className="px-3 py-1 bg-yellow-500 text-white rounded shadow-sm hover:opacity-90"
        >
          {loading ? "..." : "En progreso"}
        </button>
      )}

      {incident.status !== "RESOLVED" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("RESOLVED")}
          className="px-3 py-1 bg-green-500 text-white rounded shadow-sm hover:opacity-90"
        >
          {loading ? "..." : "Resolver"}
        </button>
      )}
    </div>
  );
}
