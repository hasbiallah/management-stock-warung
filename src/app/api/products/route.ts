import { NextResponse } from "next/server";

import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { productInputSchema } from "@/presentation/product/product-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  return NextResponse.json(await catalogueUseCases.listActiveProducts({ query }));
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, productInputSchema);
  if (!parsed.ok) return parsed.response;

  const product = await catalogueUseCases.createProduct(parsed.data);
  return NextResponse.json(product, { status: 201 });
}
