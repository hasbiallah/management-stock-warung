import { NextResponse } from "next/server";

import { InactiveProductError, InsufficientStockError, InvalidStockOutQuantityError } from "@/application/stock-movement/record-stock-out";
import { stockOutInputSchema } from "@/presentation/stock-movement/stock-out-input";
import { catalogueUseCases } from "@/presentation/stock-movement/catalogue-dependencies";

export async function POST(request: Request) {
  const input = stockOutInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Stok Keluar tidak valid." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await catalogueUseCases.recordStockOut(input.data), { status: 201 });
  } catch (error) {
    if (error instanceof InactiveProductError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof InvalidStockOutQuantityError || error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
