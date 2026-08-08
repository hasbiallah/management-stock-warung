import { NextResponse } from "next/server";
import { productDependencies } from "@/app/product-catalogue-dependencies";
import { deactivateProduct, updateProduct } from "@/application/product/manage-product-catalogue";
import { productInputSchema } from "@/presentation/product/product-input";

type RouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteContext) {
  const input = productInputSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data Produk tidak valid." },
      { status: 400 },
    );
  }

  const product = await updateProduct(params.id, input.data, productDependencies());

  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const deactivated = await deactivateProduct(params.id, productDependencies());

  if (!deactivated) {
    return NextResponse.json({ error: "Produk tidak ditemukan atau sudah nonaktif." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
