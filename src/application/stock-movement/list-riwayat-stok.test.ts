import { describe, expect, it } from "vitest";

import {
  ProductNotFoundError,
  listRiwayatStok,
  serialiseRiwayatStokToCsv,
} from "./list-riwayat-stok";
import type { Product, ProductRepository } from "@/domain/product/product-repository";
import type {
  CreateStockMovement,
  StockMovement,
  StockMovementRepository,
  StockMovementWithStockAfter,
} from "@/domain/stock-movement/stock-movement-repository";

class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[]) {}
  async create(): Promise<Product> { throw new Error("not used"); }
  async update(): Promise<Product | null> { throw new Error("not used"); }
  async deactivate(): Promise<boolean> { throw new Error("not used"); }
  async findActiveByName(): Promise<Product[]> { throw new Error("not used"); }
  async findActiveById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id && p.active) ?? null;
  }
}

class InMemoryStockMovementRepository implements StockMovementRepository {
  constructor(private readonly rows: StockMovementWithStockAfter[]) {}
  async create(): Promise<StockMovement> { throw new Error("not used"); }
  async findCurrentStocks(): Promise<Record<string, number>> { throw new Error("not used"); }
  async findByProductId(productId: string): Promise<StockMovementWithStockAfter[]> {
    return this.rows.filter((row) => row.productId === productId);
  }
}

function makeMovement(partial: Partial<StockMovementWithStockAfter> & { id: string; productId: string; type: StockMovementWithStockAfter["type"]; }): StockMovementWithStockAfter {
  return {
    id: partial.id,
    productId: partial.productId,
    type: partial.type,
    quantity: partial.quantity ?? 0,
    quantityAfter: partial.quantityAfter ?? null,
    reason: partial.reason ?? null,
    createdAt: partial.createdAt ?? new Date("2026-01-01T00:00:00Z"),
    stockAfter: partial.stockAfter ?? 0,
  };
}

describe("listRiwayatStok", () => {
  it("throws ProductNotFoundError for unknown product", async () => {
    const products = new InMemoryProductRepository([]);
    const movements = new InMemoryStockMovementRepository([]);
    await expect(listRiwayatStok({ productId: "x" }, { products, movements })).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("throws ProductNotFoundError for inactive product", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula", unit: "kg", sellingPrice: 1, minimumStock: 0, active: false },
    ]);
    const movements = new InMemoryStockMovementRepository([]);
    await expect(listRiwayatStok({ productId: "gula" }, { products, movements })).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("returns entries newest-first with time, type, quantity, opname reason, and stock after each movement", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula", unit: "kg", sellingPrice: 1, minimumStock: 0, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository([
      makeMovement({ id: "1", productId: "gula", type: "MASUK", quantity: 10, stockAfter: 10 }),
      makeMovement({ id: "2", productId: "gula", type: "KELUAR", quantity: 3, stockAfter: 7 }),
      makeMovement({ id: "3", productId: "gula", type: "OPNAME", quantity: 0, quantityAfter: 5, reason: "Hitung fisik", stockAfter: 5 }),
    ]);

    const entries = await listRiwayatStok({ productId: "gula" }, { products, movements });

    expect(entries.map((e) => e.type)).toEqual(["OPNAME", "KELUAR", "MASUK"]);
    expect(entries.map((e) => e.stockAfter)).toEqual([5, 7, 10]);
    expect(entries[0].reason).toBe("Hitung fisik");
    expect(entries[1].reason).toBeNull();
    expect(entries[2].reason).toBeNull();
    expect(entries[0].quantity).toBe(0);
  });

  it("excludes movements of other products", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula", unit: "kg", sellingPrice: 1, minimumStock: 0, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository([
      makeMovement({ id: "1", productId: "gula", type: "MASUK", quantity: 4, stockAfter: 4 }),
      makeMovement({ id: "2", productId: "garam", type: "MASUK", quantity: 99, stockAfter: 99 }),
    ]);
    const entries = await listRiwayatStok({ productId: "gula" }, { products, movements });
    expect(entries.map((e) => e.stockAfter)).toEqual([4]);
  });
});

describe("serialiseRiwayatStokToCsv", () => {
  it("emits a CRLF-terminated header row followed by entries in the given order", () => {
    const csv = serialiseRiwayatStokToCsv([
      { occurredAt: new Date("2026-01-03T00:00:00Z"), type: "OPNAME", quantity: 0, reason: "Bulanan", stockAfter: 5 },
      { occurredAt: new Date("2026-01-02T00:00:00Z"), type: "KELUAR", quantity: 3, reason: null, stockAfter: 7 },
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Waktu,Tipe,Jumlah,Alasan Opname,Stok setelah gerakan");
    expect(lines[1]).toBe("2026-01-03T00:00:00.000Z,OPNAME,0,Bulanan,5");
    expect(lines[2]).toBe("2026-01-02T00:00:00.000Z,KELUAR,3,,7");
    expect(lines[3]).toBe("");
  });

  it("escapes commas, quotes, and newlines in the Opname reason", () => {
    const csv = serialiseRiwayatStokToCsv([
      { occurredAt: new Date("2026-01-01T00:00:00Z"), type: "OPNAME", quantity: 0, reason: 'Ada, "rusak"\nbaris dua', stockAfter: 0 },
    ]);
    const dataLine = csv.split("\r\n")[1];
    expect(dataLine).toBe('2026-01-01T00:00:00.000Z,OPNAME,0,"Ada, ""rusak""\nbaris dua",0');
  });
});
