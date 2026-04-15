"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { showSuccess, showError } from "@/lib/toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CreateUserModal from "@/components/ui/CreateUserModal";
import EditUserModal from "@/components/ui/EditUserModal";

type User = {
  id: string;
  email: string;
  role: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  property_residents?: any[];
};

type Property = {
  id: string;
  name: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const filteredUsers = users.filter((u) =>
    `${u.profiles?.first_name || ""} ${u.profiles?.last_name || ""} ${u.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const grouped = {
    ADMIN: filteredUsers.filter((u) => u.role === "ADMIN"),
    SUPER_ADMIN: filteredUsers.filter((u) => u.role === "SUPER_ADMIN"),
    JUNTA: filteredUsers.filter((u) => u.role === "JUNTA"),
    RESIDENTE: filteredUsers.filter((u) => u.role === "RESIDENTE"),
  };

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RESIDENTE");
  const [propertyId, setPropertyId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (Array.isArray(data)) {
      setUsers(data);
    } else {
      console.error("Error API users:", data);
      setUsers([]);
    }
  }

  async function loadProperties() {
    const res = await fetch("/api/properties");
    const data = await res.json();
    setProperties(data || []);
  }

  useEffect(() => {
    loadUsers();
    loadProperties();
  }, []);

  async function handleCreate(formData: any) {
    try {
      setLoading(true);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "RESIDENTE", // 👈 fijo por ahora
          property_id: formData.property_id || null,

          // 🔥 datos extra (para futuro)
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          type: formData.type,
          is_payer: formData.is_payer,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      showSuccess("Usuario creado correctamente");

      setOpenCreateModal(false);
      await loadUsers();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(formData: any) {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      showSuccess("Usuario actualizado");

      setOpenEditModal(false);

      await loadUsers();
    } catch (err: any) {
      showError(err.message);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/users/${selectedId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        showError("Error al eliminar usuario");
        return;
      }

      showSuccess("Usuario eliminado");

      setOpenModal(false);
      setSelectedId(null);

      await loadUsers();
    } finally {
      setDeleting(false);
    }
  }

  function renderSection(title: string, data: any[]) {
    if (data.length === 0) return null;

    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">{title}</h2>

        <div className="grid gap-3">
          {data.map((u) => (
            <Card key={u.id}>
              <div className="flex justify-between items-center">
                {/* IZQUIERDA */}
                <div className="space-y-1">
                  <p className="font-medium">
                    {u.profiles?.first_name} {u.profiles?.last_name}
                  </p>

                  <p className="text-xs text-muted-foreground">{u.email}</p>

                  <p className="text-xs text-muted-foreground">
                    📞 {u.profiles?.phone || "Sin teléfono"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    🏠{" "}
                    {u.property_residents?.[0]?.properties?.name ||
                      "Sin propiedad"}
                  </p>

                  {/* BADGE pequeño */}
                  <div>
                    <Badge status={u.role} />
                  </div>
                </div>

                {/* DERECHA */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedUser(u);
                      setOpenEditModal(true);
                    }}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedId(u.id);
                      setOpenModal(true);
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-heading">Usuarios</h1>
      <input
        placeholder="Buscar usuario..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <Button onClick={() => setOpenCreateModal(true)}>Crear usuario</Button>

      {/* LISTA */}
      <div className="space-y-8">
        {renderSection("Administradores", [
          ...grouped.ADMIN,
          ...grouped.SUPER_ADMIN,
        ])}

        {renderSection("Junta", grouped.JUNTA)}

        {renderSection("Residentes", grouped.RESIDENTE)}
      </div>
      <CreateUserModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        properties={properties}
        onCreate={handleCreate}
      />
      <ConfirmModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar usuario?"
        loading={deleting}
      />
      <EditUserModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        user={selectedUser}
        properties={properties}
        onSave={handleUpdate}
      />
    </div>
  );
}
