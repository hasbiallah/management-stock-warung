import { NextResponse } from "next/server";

import { recordOpname } from "@/application/stock-movement";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { stockMovementErrorResponse } from "@/presentation/api/handle-stock-movement-error";
import { opnameInputSchema } from "@/presentation/stock-movement/opname-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, opnameInputSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return NextResponse.json(await catalogueUseCases.recordOpname(parsed.data), { status: 201 });
  } catch (error) {
    if (error instanceof Error) return stockMovementErrorResponse(error);
    throw error;
  }
}
