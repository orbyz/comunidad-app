import { NextRequest, NextResponse } from "next/server";
import { createDebt } from "@/lib/modules/debts/debts.service";
import { supabase } from "@/lib/db/supabase";

// ✅ POST (crear deuda)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.property_id || !body.amount || !body.due_date) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const debt = await createDebt({
      property_id: body.property_id,
      amount: body.amount,
      due_date: body.due_date,
    });

    return NextResponse.json(debt);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ GET (ver deudas)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("property_id");

  let query = supabase.from("debts").select("*");

  if (propertyId) {
    query = query.eq("property_id", propertyId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
