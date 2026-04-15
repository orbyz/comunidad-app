"use client";

import { useEffect, useState, useCallback } from "react";
import IncidentTimeline from "./IncidentTimeline";
import CommentInput from "./CommentInput";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import IncidentActions from "./IncidentActions";
import { createBrowserClient } from "@supabase/ssr";

export default function IncidentDetail({
  incidentId,
  onUpdate,
}: {
  incidentId: string;
  onUpdate: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 🔥 LOAD INCIDENT
  const load = useCallback(async () => {
    if (!incidentId) return;

    const res = await fetch(`/api/incidents/${incidentId}`);
    const data = await res.json();

    setData(data);
  }, [incidentId]);

  const loadAndSync = async () => {
    await load();
    onUpdate();
  };

  // 🔥 INIT
  useEffect(() => {
    load();
  }, [load]);

  // 🔥 PROFILE
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  // 🔥 USERS (para nombres)
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("Users error:", data);
          setUsers([]); // 🔥 fallback seguro
          return;
        }

        setUsers(data);
      })
      .catch(() => setUsers([]));
  }, []);

  // 🔥 REALTIME
  useEffect(() => {
    const channel = supabase
      .channel("incident-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "incident_comments",
        },
        (payload) => {
          if (payload.new.incident_id === incidentId) {
            load();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incidentId, load, supabase]);

  // 🔥 HELPER USER NAME
  const getUserName = (id: string) => {
    if (!Array.isArray(users)) return id;

    const user = users.find((u) => u.id === id);

    if (!user) return id;

    const profile = Array.isArray(user.profiles)
      ? user.profiles[0]
      : user.profiles;

    if (profile?.first_name || profile?.last_name) {
      return `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    }

    return user.email || id;
  };

  // 🔥 STATES UI (DESPUÉS de hooks)
  if (!data) return <div>Cargando...</div>;

  if (!data.incident) {
    return <div className="text-red-500">Error cargando incidencia</div>;
  }

  const incident = data.incident;
  const comments = data.comments || [];
  const history = data.history || [];
  const followersCount = data.followersCount || 0;

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="border-b pb-4 mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{incident.title}</h2>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span>👥</span>
            <span>
              {followersCount} vecino{followersCount === 1 ? "" : "s"} afectados
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Estado:</span>
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Prioridad:</span>
            <PriorityBadge priority={incident.priority} />
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      {profile?.role !== "RESIDENTE" && (
        <div className="mb-4 p-3 border rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Acciones</p>

          <IncidentActions incident={incident} onUpdate={loadAndSync} />
        </div>
      )}

      {/* TIMELINE */}
      <div className="flex-1 overflow-y-auto pr-2">
        <IncidentTimeline
          comments={comments}
          history={history}
          getUserName={getUserName}
        />
      </div>

      {/* INPUT */}
      <CommentInput incidentId={incidentId} onComment={loadAndSync} />
    </div>
  );
}
