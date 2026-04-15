import { NextRequest, NextResponse } from "next/server";
import { getIncidentDetailService } from "@/lib/modules/incidents/incidents.service";
import { getUserProfile } from "@/lib/auth/getUserProfile";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing incident id" },
        { status: 400 },
      );
    }

    const data = await getIncidentDetailService(id);

    if (!data || !data.incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 },
      );
    }

    const incident = data.incident;

    // 🔐 MULTI-TENANT PROTECTION
    if (profile.role === "RESIDENTE") {
      if (!profile.property_id) {
        return NextResponse.json(
          { error: "No property assigned" },
          { status: 400 },
        );
      }

      if (incident.property_id !== profile.property_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // 🔐 ADMIN → puede ver todo (MVP)
    // luego puedes restringir por propiedad si quieres

    return NextResponse.json({
      incident,
      comments: data.comments || [],
      history: data.history || [],
    });
  } catch (err: any) {
    console.error("GET /api/incidents/[id] error:", err);

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
