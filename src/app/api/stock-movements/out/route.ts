import { NextResponse } from "next/server";

import { recordStockOut } from "@/application/stock-movement";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { stockMovementErrorResponse } from "@/presentation/api/handle-stock-movement-error";
import { stockOutInputSchema } from "@/presentation/stock-movement/stock-out-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, stockOutInputSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return NextResponse.json(await catalogueUseCases.recordStockOut(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error) return stockMovementErrorResponse(error);
    throw error;
  }
}
