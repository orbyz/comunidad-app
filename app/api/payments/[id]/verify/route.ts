import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/modules/payments/payments.service";
// import { getUserProfile } from "@/lib/auth/getUserProfile";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 },
      );
    }
    // const profile = await getUserProfile();

    // if (!profile) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // if (!["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const payment = await verifyPayment(id);

    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
