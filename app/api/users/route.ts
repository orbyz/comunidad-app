import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { hasRole } from "@/lib/auth/rbac";

// 🔹 Admin client (service role)
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    },
  );
}

// 🧱 GET USERS
export async function GET() {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        role,
        profiles (
          first_name,
          last_name,
          phone
        ),
        property_residents (
          property_id,
          type,
          is_payer,
          properties (
            name
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🧱 CREATE USER
export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const {
      email,
      password,
      role,
      property_id,
      first_name,
      last_name,
      phone,
      type,
      is_payer,
    } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "email, password y role son obligatorios" },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // 🔹 1. Crear en AUTH
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authUser.user?.id;

    // 🔹 2. Insertar en USERS (core)
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email,
      role,
      property_id: property_id || null, // opcional (legacy)
    });

    if (userError) {
      console.error("USER INSERT ERROR:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    // 🔹 3. PERFIL (datos personales)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name,
      last_name,
      phone,
    });

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    // 🔹 4. RELACIÓN CON PROPIEDAD (negocio real)
    if (property_id) {
      const { error: relationError } = await supabase
        .from("property_residents")
        .insert({
          property_id,
          user_id: userId,
          type: type || "OWNER",
          is_payer: is_payer ?? true,
        });

      if (relationError) {
        return NextResponse.json(
          { error: relationError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error inesperado" },
      { status: 500 },
    );
  }
}
