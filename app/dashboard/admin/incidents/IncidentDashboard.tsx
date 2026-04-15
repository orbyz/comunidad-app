"use client";

import { useState, useEffect } from "react";
import IncidentList from "./components/IncidentList";
import IncidentDetail from "./components/IncidentDetail";
import CreateIncidentModal from "./components/CreateIncidentModal";
import IncidentKPIs from "./components/IncidentKPIs";
import CriticalIncidents from "./components/CriticalIncidents";

export default function IncidentDashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const loadIncidents = async () => {
    const res = await fetch("/api/incidents");
    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      console.error("Error loading incidents:", data);
      setIncidents([]); // 🔥 SIEMPRE ARRAY
      return;
    }

    setIncidents(data);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Incidencias</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Nueva incidencia
        </button>
      </div>

      {/* 🔥 KPIs */}
      <IncidentKPIs incidents={incidents} />

      {/* 🔥 CRÍTICAS */}
      <CriticalIncidents incidents={incidents} onSelect={setSelectedId} />

      {/* 🔥 MAIN GRID */}
      <div className="grid grid-cols-12 flex-1 overflow-hidden border rounded-xl">
        {/* LEFT */}
        <div className="col-span-4 border-r overflow-y-auto">
          <IncidentList
            incidents={incidents}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* RIGHT */}
        <div className="col-span-8 p-4 overflow-y-auto">
          {selectedId ? (
            <IncidentDetail incidentId={selectedId} onUpdate={loadIncidents} />
          ) : (
            <div className="text-gray-400">Selecciona una incidencia</div>
          )}
        </div>
      </div>

      {/* 🔥 MODAL */}
      <CreateIncidentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadIncidents}
      />
    </div>
  );
}
