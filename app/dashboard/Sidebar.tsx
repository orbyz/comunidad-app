"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Home,
  Menu,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded transition-all ${
      pathname.startsWith(path)
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside
      className={`
        h-screen sticky top-0
        bg-gray-900 text-white p-4
        flex flex-col
        transition-all
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* TOP */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <h2 className="text-lg font-bold">Condominio</h2>}

        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* TODO el contenido de navegación */}
        {/* ADMIN */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <div className="space-y-2 mb-6">
            {!collapsed && (
              <p className="text-xs text-gray-400 uppercase">Admin</p>
            )}

            <Link
              href="/dashboard/admin"
              className={linkClass("/dashboard/admin")}
            >
              <LayoutDashboard size={18} />
              {!collapsed && "Dashboard"}
            </Link>

            <Link
              href="/dashboard/admin/payments"
              className={linkClass("/dashboard/admin/payments")}
            >
              <CreditCard size={18} />
              {!collapsed && "Pagos"}
            </Link>

            <Link
              href="/dashboard/admin/debts"
              className={linkClass("/dashboard/admin/debts")}
            >
              <FileText size={18} />
              {!collapsed && "Deudas"}
            </Link>

            <Link
              href="/dashboard/admin/users"
              className={linkClass("/dashboard/admin/users")}
            >
              <LayoutDashboard size={18} />
              {!collapsed && "Usuarios"}
            </Link>
            <Link
              href="/dashboard/admin/incidents"
              className={linkClass("/dashboard/admin/incidents")}
            >
              <AlertTriangle size={18} />
              {!collapsed && "Incidencias"}
            </Link>
            <Link
              href="/dashboard/admin/finance"
              className={linkClass("/dashboard/admin/finance")}
            >
              <DollarSign size={18} />
              {!collapsed && "Finanzas"}
            </Link>
          </div>
        )}

        {/* JUNTA */}
        {role === "JUNTA" && (
          <div className="space-y-2 mb-6">
            {!collapsed && (
              <p className="text-xs text-gray-400 uppercase">Junta</p>
            )}

            <Link
              href="/dashboard/junta"
              className={linkClass("/dashboard/junta")}
            >
              <LayoutDashboard size={18} />
              {!collapsed && "Resumen"}
            </Link>

            <Link
              href="/dashboard/junta/incidents"
              className={linkClass("/dashboard/junta/incidents")}
            >
              <AlertTriangle size={18} />
              {!collapsed && "Incidencias"}
            </Link>
          </div>
        )}

        {/* RESIDENTE */}
        {role === "RESIDENTE" && (
          <div className="space-y-2">
            {!collapsed && (
              <p className="text-xs text-gray-400 uppercase">Mi vivienda</p>
            )}

            <Link
              href="/dashboard/resident"
              className={linkClass("/dashboard/resident")}
            >
              <Home size={18} />
              {!collapsed && "Dashboard"}
            </Link>

            <Link
              href="/dashboard/resident/incidents"
              className={linkClass("/dashboard/resident/incidents")}
            >
              <AlertTriangle size={18} />
              {!collapsed && "Incidencias"}
            </Link>

            <Link
              href="/dashboard/resident/payments"
              className={linkClass("/dashboard/resident/payments")}
            >
              <CreditCard size={18} />
              {!collapsed && "Mis pagos"}
            </Link>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="w-full px-3 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition"
        >
          {collapsed ? "⏻" : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
