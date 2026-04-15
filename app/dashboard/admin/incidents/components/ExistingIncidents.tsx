"use client";

import { useEffect, useState } from "react";

export default function ExistingIncidents({
  propertyId,
  onSelect,
}: {
  propertyId: string;
  onSelect: (id: string) => void;
}) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null); // ✅ AQUÍ

  useEffect(() => {
    if (!propertyId) return;

    fetch(`/api/incidents?property_id=${propertyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setIncidents([]);
          return;
        }

        const active = data.filter((i: any) => i.status !== "RESOLVED");

        setIncidents(active);
      });
  }, [propertyId]);

  // ✅ ahora sí puedes usar return condicional
  if (!incidents.length) return null;

  return (
    <div className="border rounded p-3 bg-yellow-50">
      <p className="text-sm font-medium mb-2">
        ⚠️ Ya existen incidencias similares
      </p>

      <div className="space-y-2">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex justify-between items-center border p-2 rounded bg-white"
          >
            <div>
              <p className="text-sm font-medium">{incident.title}</p>
              <p className="text-xs text-gray-500">Estado: {incident.status}</p>
            </div>

            <button
              disabled={loadingId === incident.id}
              onClick={async () => {
                setLoadingId(incident.id);

                await fetch(`/api/incidents/${incident.id}/follow`, {
                  method: "POST",
                });

                onSelect(incident.id);
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              {loadingId === incident.id ? "..." : "Unirme"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
