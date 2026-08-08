import { NextResponse } from "next/server";

import { ProductNotFoundError, listRiwayatStok, serialiseRiwayatStokToCsv } from "@/application/stock-movement";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";

function parseFormat(value: string | null): "json" | "csv" {
  return value === "csv" ? "csv" : "json";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") ?? "";
  const format = parseFormat(url.searchParams.get("format"));

  if (!productId) {
    return NextResponse.json({ error: "Pilih Produk aktif." }, { status: 400 });
  }

  try {
    const products = new PrismaProductRepository();
    const movements = new PrismaStockMovementRepository();
    const entries = await listRiwayatStok({ productId }, { products, movements });

    if (format === "csv") {
      const csv = serialiseRiwayatStokToCsv(entries);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="riwayat-stok-${productId}.csv"`,
        },
      });
    }

    return NextResponse.json(entries);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
