import { NextResponse } from "next/server";

import { catalogueDependencies } from "@/app/product-catalogue-dependencies";
import {
  ProductNotFoundError,
  listRiwayatStok,
  serialiseRiwayatStokToCsv,
} from "@/application/stock-movement/list-riwayat-stok";

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId") ?? "";

  if (!productId) {
    return NextResponse.json({ error: "Pilih Produk aktif." }, { status: 400 });
  }

  try {
    const entries = await listRiwayatStok({ productId }, catalogueDependencies());
    const csv = serialiseRiwayatStokToCsv(entries);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="riwayat-stok-${productId}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
