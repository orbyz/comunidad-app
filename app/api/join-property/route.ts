import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { ResidentType } from "@/lib/constants/roles";

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
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

    // 🔍 buscar código
    const { data: invite, error: inviteError } = await supabase
      .from("property_invites")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    if (inviteError) throw inviteError;

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 },
      );
    }

    // 🔥 comprobar si ya pertenece
    const { data: existing } = await supabase
      .from("property_residents")
      .select("id")
      .eq("user_id", profile.id)
      .eq("property_id", invite.property_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    // 🧱 crear relación
    const { error: insertError } = await supabase
      .from("property_residents")
      .insert({
        user_id: profile.id,
        property_id: invite.property_id,
        type: ResidentType.TENANT,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("JOIN PROPERTY ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
