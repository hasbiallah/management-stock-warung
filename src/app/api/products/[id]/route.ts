import { NextResponse } from "next/server";

import { productInputSchema } from "@/presentation/product/product-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteContext) {
  const input = productInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Produk tidak valid." },
      { status: 400 },
    );
  }

  const product = await catalogueUseCases.updateProduct(params.id, input.data);

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
