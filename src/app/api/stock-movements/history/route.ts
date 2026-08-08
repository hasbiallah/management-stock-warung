import { NextResponse } from "next/server";

import { ProductNotFoundError, listRiwayatStok, serialiseRiwayatStokToCsv } from "@/application/stock-movement";
import { stockMovementErrorResponse } from "@/presentation/api/handle-stock-movement-error";
import { catalogueUseCases } from "@/presentation/catalogue/use-cases";

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
    const entries = await catalogueUseCases.listRiwayatStok({ productId });

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
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error) return stockMovementErrorResponse(error);
    throw error;
  }
}
