"use client";

import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function IncidentList({
  incidents = [],
  selectedId,
  onSelect,
}: any) {
  return (
    <div className="overflow-y-auto h-full">
      {incidents.length === 0 && (
        <div className="p-4 text-sm text-gray-400">No hay incidencias</div>
      )}

      {incidents.map((inc: any) => {
        const isSelected = selectedId === inc.id;
        const isHigh = inc.priority === "HIGH";

        const date = inc.created_at ? new Date(inc.created_at) : null;

        const formattedDate =
          date && !isNaN(date.getTime()) ? date.toLocaleDateString() : "—";

        return (
          <div
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className={`
              p-4 cursor-pointer border-b transition
              hover:bg-gray-50
              ${isSelected ? "bg-gray-100" : ""}
              ${isHigh ? "bg-red-50 border-l-4 border-red-500" : ""}
            `}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">
                {inc.title || "Sin título"}
              </h3>

              {isHigh && (
                <span className="text-xs text-red-600 font-semibold">
                  CRÍTICO
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={inc.status} />
              <PriorityBadge priority={inc.priority} />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>Por: {inc.user?.email || "Sin usuario"}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
