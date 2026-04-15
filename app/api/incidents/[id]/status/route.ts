import { NextRequest, NextResponse } from "next/server";
import { changeIncidentStatusService } from "@/lib/modules/incidents/incidents.service";
import { changeStatusSchema } from "@/lib/modules/incidents/incidents.validators";
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

    if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN", "JUNTA"])) {
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

    const parsed = changeStatusSchema.safeParse({
      incident_id: id,
      status: body.status,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const updated = await changeIncidentStatusService(
      parsed.data.incident_id,
      parsed.data.status,
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
