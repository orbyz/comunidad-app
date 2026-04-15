"use client";

export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[status] || ""}`}>
      {status}
    </span>
  );
}
