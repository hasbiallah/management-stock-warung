import { NextResponse } from "next/server";

import { recordStockMovement } from "@/application/stock-movement";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { opnameInputSchema } from "@/presentation/stock-movement/opname-input";
import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";

const ERROR_MESSAGES: Record<string, string> = {
  INACTIVE_PRODUCT: "Produk aktif tidak ditemukan.",
  INVALID_QUANTITY: "Jumlah stok hasil hitung fisik harus berupa bilangan bulat tidak negatif.",
  INSUFFICIENT_STOCK: "Stok tersedia tidak mencukupi.",
  EMPTY_REASON: "Alasan Opname wajib diisi.",
};

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, opnameInputSchema);
  if (!parsed.ok) return parsed.response;

  const products = new PrismaProductRepository();
  const movements = new PrismaStockMovementRepository();

  const result = await recordStockMovement(
    { type: "OPNAME", ...parsed.data },
    { products, movements }
  );

  if (!result.success) {
    const message = ERROR_MESSAGES[result.error.code] || "Terjadi kesalahan.";
    const status = result.error.code === "INACTIVE_PRODUCT" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json(result, { status: 201 });
}
