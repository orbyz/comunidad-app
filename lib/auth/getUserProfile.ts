import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserProfile() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // server component → ignore
          }
        },
      },
    },
  );

  // 🔐 1. Auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 🔥 manejar error de sesión inexistente (IMPORTANTE)
  if (authError) {
    if (authError.code === "refresh_token_not_found") {
      return null; // no hay sesión → normal
    }

    console.error("AUTH ERROR:", authError);
    return null;
  }

  if (!user) return null;

  // 👤 2. Profile base
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role, tenant_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("PROFILE ERROR:", profileError);
    return null;
  }

  // 🏠 3. Property relation
  const { data: residents, error: residentError } = await supabase
    .from("property_residents")
    .select("property_id")
    .eq("user_id", user.id);

  if (residentError) {
    console.error("RESIDENT ERROR:", residentError);
    return null;
  }

  // 🔥 MVP: primera propiedad
  const property_id = residents?.[0]?.property_id || null;

  return {
    ...profile,
    property_id,
  };
}
