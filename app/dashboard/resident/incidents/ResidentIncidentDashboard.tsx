"use client";

import { useEffect, useState } from "react";
import IncidentList from "../../admin/incidents/components/IncidentList";
import IncidentDetail from "../../admin/incidents/components/IncidentDetail";
import CreateIncidentModal from "../../admin/incidents/components/CreateIncidentModal";

export default function ResidentIncidentDashboard() {
  const [incidents, setIncidents] = useState<any[] | null>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const loadIncidents = async () => {
    const res = await fetch("/api/incidents");
    const data = await res.json();

    // 🔥 ERROR CONTROLADO
    if (!res.ok) {
      console.error("Error loading incidents:", data);

      if (data.error === "User has no property assigned") {
        setIncidents(null); // 👈 estado especial
        return;
      }

      setIncidents([]);
      return;
    }

    // 🔥 SEGURIDAD EXTRA
    if (!Array.isArray(data)) {
      setIncidents([]);
      return;
    }

    setIncidents(data);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // 🔥 ESTADO: SIN PROPIEDAD
  if (incidents === null) {
    return (
      <div className="p-6 text-gray-500">
        No estás asignado a ninguna propiedad.
        <br />
        Contacta con el administrador.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Incidencias</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Reportar incidencia
        </button>
      </div>

      {/* CONTENIDO */}
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

      {/* MODAL */}
      <CreateIncidentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadIncidents}
      />
    </div>
  );
}
