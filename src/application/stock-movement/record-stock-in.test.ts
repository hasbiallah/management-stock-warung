import { describe, expect, it } from "vitest";

import { InMemoryProductRepository, InMemoryStockMovementRepository } from "@/application/__tests__/in-memory-repositories";
import { InactiveProductError, recordStockIn } from "./record-stock-in";
import type { Product } from "@/domain/product/product-repository";
import type { StockMovement } from "@/domain/stock-movement/stock-movement-repository";

function expectMovement(actual: StockMovement, expected: { id: string; productId: string; type: StockMovement["type"]; quantity: number }) {
  expect(actual.id).toBe(expected.id);
  expect(actual.productId).toBe(expected.productId);
  expect(actual.type).toBe(expected.type);
  expect(actual.quantity).toBe(expected.quantity);
  expect(actual.createdAt).toBeInstanceOf(Date);
}

describe("recordStockIn", () => {
  it("appends a Gerakan Stok MASUK and returns the updated Stok for an active Produk", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 7 });

    await expect(recordStockIn({ productId: "gula", quantity: 5 }, { products, movements })).resolves.toEqual({
      movement: { id: "2", createdAt: expect.any(Date), productId: "gula", type: "MASUK", quantity: 5 },
      stock: 12,
    });
    expect(movements.movements).toHaveLength(2);
    expectMovement(movements.movements[0], { id: "1", productId: "gula", type: "MASUK", quantity: 7 });
    expectMovement(movements.movements[1], { id: "2", productId: "gula", type: "MASUK", quantity: 5 });
  });

  it("does not record Stok Masuk for an inactive Produk", async () => {
    const products = new InMemoryProductRepository([
      { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
    ] satisfies Product[]);
    const movements = new InMemoryStockMovementRepository();

    await expect(recordStockIn({ productId: "lama", quantity: 5 }, { products, movements })).rejects.toBeInstanceOf(InactiveProductError);
    expect(movements.movements).toEqual([]);
  });
});
