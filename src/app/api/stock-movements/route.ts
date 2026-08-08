import { NextResponse } from "next/server";

import { recordStockMovement } from "@/application/stock-movement";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { stockInInputSchema } from "@/presentation/stock-movement/stock-movement-input";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";

const ERROR_MESSAGES: Record<string, string> = {
  INACTIVE_PRODUCT: "Produk aktif tidak ditemukan.",
  INVALID_QUANTITY: "Jumlah Stok Masuk harus berupa bilangan bulat lebih dari nol.",
  INSUFFICIENT_STOCK: "Stok tersedia tidak mencukupi.",
  EMPTY_REASON: "Alasan Opname wajib diisi.",
};

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, stockInInputSchema);
  if (!parsed.ok) return parsed.response;

  const products = new PrismaProductRepository();
  const movements = new PrismaStockMovementRepository();

  const result = await recordStockMovement(
    { type: "MASUK", ...parsed.data },
    { products, movements }
  );

  if (!result.success) {
    const message = ERROR_MESSAGES[result.error.code] || "Terjadi kesalahan.";
    const status = result.error.code === "INACTIVE_PRODUCT" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
