import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { hasRole } from "@/lib/auth/rbac";
import { getAdminClient } from "@/lib/auth/adminClient";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const profile = await getUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } },
  );

  // 🔥 1. eliminar de auth
  await supabase.auth.admin.deleteUser(id);

  // 🔥 2. eliminar de tabla users
  await supabase.from("users").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const profile = await getUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const supabase = getAdminClient();

  // 🔹 actualizar perfil
  await supabase
    .from("profiles")
    .update({
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
    })
    .eq("id", id);

  // 🔹 actualizar relación vivienda
  await supabase
    .from("property_residents")
    .update({
      property_id: body.property_id,
      type: body.type,
      is_payer: body.is_payer,
    })
    .eq("user_id", id);

  return NextResponse.json({ ok: true });
}
