import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserProfile() {
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

  // 🔐 1. Auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 👤 2. Profile base
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role, tenant_id")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  // 🏠 3. Property relation (IMPORTANT)
  const { data: residents, error: residentError } = await supabase
    .from("property_residents")
    .select("property_id")
    .eq("user_id", user.id);

  if (residentError) throw residentError;

  // 🔥 tomar la primera (MVP)
  const property_id = residents?.[0]?.property_id || null;

  return {
    ...profile,
    property_id,
  };
}
