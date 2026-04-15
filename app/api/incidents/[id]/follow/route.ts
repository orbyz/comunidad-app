import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import { followIncidentService } from "@/lib/modules/incidents/incidents.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await followIncidentService(id, profile.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
