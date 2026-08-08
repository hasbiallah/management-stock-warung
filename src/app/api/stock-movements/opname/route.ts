import { NextResponse } from "next/server";

import { catalogueDependencies } from "@/app/product-catalogue-dependencies";
import {
  EmptyReasonError,
  InactiveProductError,
  InvalidOpnameQuantityError,
  recordOpname,
} from "@/application/stock-movement/record-opname";
import { opnameInputSchema } from "@/presentation/stock-movement/opname-input";

export async function POST(request: Request) {
  const input = opnameInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Opname tidak valid." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await recordOpname(input.data, catalogueDependencies()), { status: 201 });
  } catch (error) {
    if (error instanceof InactiveProductError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof InvalidOpnameQuantityError || error instanceof EmptyReasonError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
