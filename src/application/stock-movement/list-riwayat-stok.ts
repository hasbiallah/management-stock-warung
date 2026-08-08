import type {
  StockMovementType,
  StockMovementWithStockAfter,
} from "@/domain/stock-movement/stock-movement-repository";
import type {
  ProductRepository,
} from "@/domain/product/product-repository";
import type { StockMovementRepository } from "@/domain/stock-movement/stock-movement-repository";

export class ProductNotFoundError extends Error {
  constructor() {
    super("Produk tidak ditemukan.");
  }
}

type Dependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

export type RiwayatStokEntry = {
  occurredAt: Date;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  stockAfter: number;
};

function toEntry(movement: StockMovementWithStockAfter): RiwayatStokEntry {
  return {
    occurredAt: movement.createdAt,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.type === "OPNAME" ? movement.reason ?? "" : null,
    stockAfter: movement.stockAfter,
  };
}

export async function listRiwayatStok(
  input: { productId: string },
  { products, movements }: Dependencies,
): Promise<RiwayatStokEntry[]> {
  const product = await products.findActiveById(input.productId);
  if (!product) {
    throw new ProductNotFoundError();
  }
  const chronological = await movements.findByProductId(input.productId);
  return chronological.map(toEntry).reverse();
}

export { ProductNotFoundError as _ProductNotFoundError };

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADER = ["Waktu", "Tipe", "Jumlah", "Alasan Opname", "Stok setelah gerakan"];

export function serialiseRiwayatStokToCsv(entries: RiwayatStokEntry[]): string {
  const lines = [HEADER.map(csvEscape).join(",")];
  for (const entry of entries) {
    lines.push(
      [
        csvEscape(entry.occurredAt.toISOString()),
        csvEscape(entry.type),
        csvEscape(String(entry.quantity)),
        csvEscape(entry.reason ?? ""),
        csvEscape(String(entry.stockAfter)),
      ].join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}
