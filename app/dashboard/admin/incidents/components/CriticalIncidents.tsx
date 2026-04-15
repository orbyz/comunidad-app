"use client";

export default function CriticalIncidents({ incidents, onSelect }: any) {
  const critical = incidents
    .filter((i: any) => i.priority === "HIGH")
    .slice(0, 5);

  if (!critical.length) return null;

  return (
    <div className="border rounded-xl p-4 bg-red-50">
      <h2 className="text-sm font-semibold text-red-700 mb-3">
        🔴 Incidencias críticas
      </h2>

      <div className="space-y-2">
        {critical.map((inc: any) => (
          <div
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className="p-2 bg-white border rounded cursor-pointer hover:bg-gray-50"
          >
            <div className="font-medium text-sm">{inc.title}</div>
            <div className="text-xs text-gray-500">{inc.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
