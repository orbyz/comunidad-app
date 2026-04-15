import { NextRequest, NextResponse } from "next/server";
import {
  createPayment,
  getPayments,
} from "@/lib/modules/payments/payments.service";
import { supabase } from "@/lib/db/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("property_id");

  let query = supabase.from("payments").select("*");

  if (propertyId) {
    query = query.eq("property_id", propertyId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payment = await createPayment({
      amount: body.amount,
      method: body.method,
      reference: body.reference,
      user_id: body.user_id, // 👈 temporal
      property_id: body.property_id,
    });

    return NextResponse.json(payment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
