import { NextRequest, NextResponse } from "next/server";
import {
  createIncidentService,
  getIncidents,
} from "@/lib/modules/incidents/incidents.service";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { hasRole } from "@/lib/auth/rbac";
import { createIncidentSchema } from "@/lib/modules/incidents/incidents.validators";

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let filters: any = {};

    if (profile.role === "RESIDENTE") {
      if (!profile.property_id) {
        return NextResponse.json(
          { error: "No property assigned" },
          { status: 400 },
        );
      }

      filters.property_id = profile.property_id;
      filters.created_by = profile.id;
    }

    if (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") {
      const { searchParams } = new URL(req.url);
      const property_id = searchParams.get("property_id");

      if (property_id) {
        filters.property_id = property_id;
      }
    }

    const data = await getIncidents(filters);

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("GET incidents error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasRole(profile.role, ["ADMIN", "SUPER_ADMIN", "RESIDENTE"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!profile.property_id) {
      return NextResponse.json(
        { error: "User has no property assigned" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const parsed = createIncidentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const incident = await createIncidentService(
      {
        ...parsed.data,
        property_id: profile.property_id, // 🔥 seguridad multi-tenant
      },
      profile.id,
    );

    return NextResponse.json(incident, { status: 201 });
  } catch (err: any) {
    console.error("POST incidents error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
