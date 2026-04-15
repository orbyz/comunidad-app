import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/auth/getUserProfile";

function generateCode() {
  return crypto.randomUUID().slice(0, 6).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { property_id } = await req.json();

    if (!property_id) {
      return NextResponse.json(
        { error: "property_id is required" },
        { status: 400 },
      );
    }

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

    let code;
    let attempts = 0;

    while (attempts < 3) {
      code = generateCode();

      const { error } = await supabase.from("property_invites").insert({
        property_id,
        code,
      });

      if (!error) break;

      attempts++;
    }

    if (!code) {
      throw new Error("Could not generate code");
    }

    return NextResponse.json({ code });
  } catch (err: any) {
    console.error("CREATE INVITE ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
