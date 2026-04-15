import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const { user_id, property_id } = body;

    const { error } = await supabase.from("property_residents").insert({
      user_id,
      property_id,
      type: "RESIDENT",
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
