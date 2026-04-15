import { NextResponse } from "next/server";
import { getPropertyBalance } from "@/lib/modules/finance/finance.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 },
      );
    }

    const balance = await getPropertyBalance(id);

    return NextResponse.json(balance);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
