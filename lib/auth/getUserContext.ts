import { getUserProfile } from "./getUserProfile";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserContext() {
  const profile = await getUserProfile();

  if (!profile) return null;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  // 🔹 1. Obtener tenant desde USERS (fuente real)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", profile.id)
    .single();

  if (userError) throw userError;

  const tenantId = userData?.tenant_id || null;

  // 🔹 2. Obtener property (solo residentes)
  let propertyId: string | null = null;

  if (profile.role === "RESIDENTE") {
    const { data: resident, error: residentError } = await supabase
      .from("property_residents")
      .select("property_id")
      .eq("user_id", profile.id)
      .single();

    if (residentError) throw residentError;

    propertyId = resident?.property_id || null;
  }

  // 🔐 VALIDACIÓN
  if (!tenantId && profile.role !== "SUPER_ADMIN") {
    throw new Error("Tenant not found for user");
  }

  return {
    userId: profile.id,
    role: profile.role,
    tenantId,
    propertyId,
  };
}
