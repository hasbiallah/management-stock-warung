import { NextResponse } from "next/server";

import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { productInputSchema } from "@/presentation/product/product-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteContext) {
  const parsed = await parseJsonBody(request, productInputSchema);
  if (!parsed.ok) return parsed.response;

  const product = await catalogueUseCases.updateProduct(params.id, parsed.data);

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const deactivated = await catalogueUseCases.deactivateProduct(params.id);

  if (!deactivated) {
    return NextResponse.json({ error: "Produk tidak ditemukan atau sudah nonaktif." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
