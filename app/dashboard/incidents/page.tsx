"use client";

import { useEffect, useState } from "react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch("/api/incidents")
      .then((res) => res.json())
      .then(setIncidents);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Incidencias</h1>

      <div className="grid gap-4">
        {incidents.map((i: any) => (
          <div key={i.id} className="border p-4 rounded-xl">
            <h2 className="font-semibold">{i.title}</h2>
            <p className="text-sm text-gray-500">{i.description}</p>
            <span className="text-xs">{i.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
