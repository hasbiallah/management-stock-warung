import { NextResponse } from "next/server";

import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { productInputSchema } from "@/presentation/product/product-input";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";
import { createProduct, listActiveProducts } from "@/application/product/manage-product-catalogue";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  const products = new PrismaProductRepository();
  const movements = new PrismaStockMovementRepository();
  return NextResponse.json(await listActiveProducts({ query }, { products, movements }));
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, productInputSchema);
  if (!parsed.ok) return parsed.response;

  const products = new PrismaProductRepository();
  const product = await createProduct(parsed.data, { products });
  return NextResponse.json(product, { status: 201 });
}
