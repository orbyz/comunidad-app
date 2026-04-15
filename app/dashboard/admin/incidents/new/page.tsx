"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ExistingIncidents from "../components/ExistingIncidents";

export default function NewIncidentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !propertyId) return;

    setLoading(true);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          property_id: propertyId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/admin/incidents`);
      } else {
        alert(data.error || "Error creando incidencia");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nueva incidencia</h1>

      {/* 🔥 AQUÍ VA LA INTELIGENCIA */}
      {propertyId && (
        <ExistingIncidents
          propertyId={propertyId}
          onSelect={(id) => {
            router.push(`/dashboard/admin/incidents?id=${id}`);
          }}
        />
      )}

      {/* FORM */}
      <div className="space-y-4">
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Property ID"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Creando..." : "Crear incidencia"}
        </button>
      </div>
    </div>
  );
}
