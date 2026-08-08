import { NextResponse } from "next/server";

import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { productInputSchema } from "@/presentation/product/product-input";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { updateProduct, deactivateProduct } from "@/application/product/manage-product-catalogue";

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteContext) {
  const parsed = await parseJsonBody(request, productInputSchema);
  if (!parsed.ok) return parsed.response;

  const products = new PrismaProductRepository();
  const product = await updateProduct(params.id, parsed.data, { products });

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const products = new PrismaProductRepository();
  const deactivated = await deactivateProduct(params.id, { products });

  if (!deactivated) {
    return NextResponse.json({ error: "Produk tidak ditemukan atau sudah nonaktif." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
