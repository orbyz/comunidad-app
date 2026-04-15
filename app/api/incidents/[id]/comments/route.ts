import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { addCommentService } from "@/lib/modules/incidents/incidents.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 🔐 Auth
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 FIX CLAVE
    const { id: incidentId } = await params;

    if (!incidentId) {
      return NextResponse.json(
        { error: "Missing incident id" },
        { status: 400 },
      );
    }

    // 📦 Body
    const body = await req.json();

    if (!body.comment || !body.comment.trim()) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 },
      );
    }

    // 🧠 Service
    await addCommentService(incidentId, body.comment, profile.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST comment error:", err);

    return NextResponse.json(
      {
        error: err.message || "Unexpected error",
      },
      { status: 500 },
    );
  }
}
