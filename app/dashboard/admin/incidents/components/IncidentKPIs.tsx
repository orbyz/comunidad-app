"use client";

export default function IncidentKPIs({ incidents }: { incidents: any[] }) {
  const total = incidents.length;

  const open = incidents.filter((i) => i.status === "OPEN").length;
  const inProgress = incidents.filter((i) => i.status === "IN_PROGRESS").length;
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length;

  const critical = incidents.filter((i) => i.priority === "HIGH").length;

  const Card = ({ title, value }: any) => (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-5 gap-4">
      <Card title="Total incidencias" value={total} />
      <Card title="Abiertas" value={open} />
      <Card title="En progreso" value={inProgress} />
      <Card title="Resueltas" value={resolved} />
      <Card title="Críticas" value={critical} />
    </div>
  );
}
