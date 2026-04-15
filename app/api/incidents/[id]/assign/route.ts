import { NextRequest, NextResponse } from "next/server";
import { assignIncidentService } from "@/lib/modules/incidents/incidents.service";
import { assignIncidentSchema } from "@/lib/modules/incidents/incidents.validators";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { hasRole } from "@/lib/auth/rbac";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing incident id" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const parsed = assignIncidentSchema.safeParse({
      incident_id: id,
      assigned_to: body.assigned_to,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await assignIncidentService(
      parsed.data.incident_id,
      parsed.data.assigned_to,
      profile.id,
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
