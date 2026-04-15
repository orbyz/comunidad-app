"use client";

import { useState, useEffect } from "react";
import ExistingIncidents from "./ExistingIncidents";

export default function CreateIncidentModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 RESET + PROFILE
  useEffect(() => {
    if (!open) return;

    // reset
    setTitle("");
    setDescription("");
    setError("");

    // load profile
    fetch("/api/me")
      .then((res) => res.json())
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [open]);

  if (!open) return null;

  const propertyId = profile?.property_id;

  const isValidDescription = description.length >= 10;
  const isFormValid = title && propertyId && isValidDescription;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setError("Completa todos los campos correctamente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          property_id: propertyId, // 🔥 SIEMPRE del profile
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.details?.fieldErrors?.description?.[0] ||
            data?.error ||
            "Error al crear incidencia",
        );
        return;
      }

      onCreated();
      onClose();
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Nueva incidencia</h2>

        {/* 🔥 ERROR */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* 🔥 PROPIEDAD */}
        <div>
          <label className="text-sm text-gray-600">Propiedad</label>

          {!profile ? (
            <div className="p-2 text-sm text-gray-400">
              Cargando propiedad...
            </div>
          ) : propertyId ? (
            <div className="p-2 border rounded bg-gray-50 text-sm">
              Propiedad asignada
            </div>
          ) : (
            <div className="text-sm text-red-500">
              No tienes propiedad asignada
            </div>
          )}
        </div>

        {/* 🔥 EXISTING INCIDENTS */}
        {propertyId && (
          <ExistingIncidents
            propertyId={propertyId}
            onSelect={() => onClose()}
          />
        )}

        {/* 🔥 TITLE */}
        <div>
          <label className="text-sm text-gray-600">Título</label>
          <input
            placeholder="Ej: Fuga de agua en baño"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {/* 🔥 DESCRIPTION */}
        <div>
          <label className="text-sm text-gray-600">Descripción</label>
          <textarea
            placeholder="Describe el problema (mínimo 10 caracteres)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />

          <p
            className={`text-xs mt-1 ${
              isValidDescription ? "text-gray-400" : "text-red-500"
            }`}
          >
            Mínimo 10 caracteres
          </p>
        </div>

        {/* 🔥 ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
