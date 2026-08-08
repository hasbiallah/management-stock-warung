import { NextResponse } from "next/server";

import { recordStockIn } from "@/application/stock-movement";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { stockMovementErrorResponse } from "@/presentation/api/handle-stock-movement-error";
import { stockInInputSchema } from "@/presentation/stock-movement/stock-movement-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, stockInInputSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return NextResponse.json(await catalogueUseCases.recordStockIn(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error) return stockMovementErrorResponse(error);
    throw error;
  }
}
