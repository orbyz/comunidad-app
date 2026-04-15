"use client";

export default function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-200 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[priority] || ""}`}>
      {priority}
    </span>
  );
}
