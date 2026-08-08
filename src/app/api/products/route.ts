import { NextResponse } from "next/server";
import { catalogueDependencies, productDependencies } from "@/app/product-catalogue-dependencies";
import { createProduct, listActiveProducts } from "@/application/product/manage-product-catalogue";
import { productInputSchema } from "@/presentation/product/product-input";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";
  return NextResponse.json(await listActiveProducts({ query }, catalogueDependencies()));
}

export async function POST(request: Request) {
  const input = productInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Produk tidak valid." },
      { status: 400 },
    );
  }

  const product = await createProduct(input.data, productDependencies());
  return NextResponse.json(product, { status: 201 });
}
