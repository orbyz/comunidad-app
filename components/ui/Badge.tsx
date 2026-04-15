import { cn } from "@/lib/utils";

export function Badge({ status }: { status: string }) {
  const base = "px-2 py-1 rounded text-xs font-semibold";

  const styles: any = {
    ADMIN: "bg-blue-600 text-white",
    SUPER_ADMIN: "bg-purple-600 text-white",
    JUNTA: "bg-orange-500 text-white",
    RESIDENTE: "bg-green-600 text-white",

    OPEN: "bg-yellow-500 text-white",
    IN_PROGRESS: "bg-blue-500 text-white",
    RESOLVED: "bg-green-600 text-white",
  };

  return (
    <span className={cn(base, styles[status] || "bg-gray-400")}>{status}</span>
  );
}
