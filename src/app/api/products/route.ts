import { NextResponse } from "next/server";

import { productInputSchema } from "@/presentation/product/product-input";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  return NextResponse.json(await catalogueUseCases.listActiveProducts({ query }));
}

export async function POST(request: Request) {
  const input = productInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Produk tidak valid." },
      { status: 400 },
    );
  }

  const product = await catalogueUseCases.createProduct(input.data);
  return NextResponse.json(product, { status: 201 });
}
