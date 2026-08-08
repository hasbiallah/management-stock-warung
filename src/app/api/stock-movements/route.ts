import { NextResponse } from "next/server";

import { InactiveProductError, InvalidStockInQuantityError } from "@/application/stock-movement/record-stock-in";
import { stockInInputSchema } from "@/presentation/stock-movement/stock-movement-input";
import { catalogueUseCases } from "@/presentation/stock-movement/catalogue-dependencies";

export async function POST(request: Request) {
  const input = stockInInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Stok Masuk tidak valid." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await catalogueUseCases.recordStockIn(input.data), { status: 201 });
  } catch (error) {
    if (error instanceof InactiveProductError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof InvalidStockInQuantityError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
