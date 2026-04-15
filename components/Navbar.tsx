"use client";

import { useRouter } from "next/navigation";

export default function Navbar({ profile }: { profile: any }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      {/* LEFT */}
      <div className="font-semibold text-lg">Dashboard</div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 text-right">
          <p className="font-medium">{profile.full_name}</p>
          <p className="text-xs text-gray-400">{profile.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
