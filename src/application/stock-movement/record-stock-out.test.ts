import { describe, expect, it } from "vitest";

import { InMemoryProductRepository, InMemoryStockMovementRepository } from "@/application/__tests__/in-memory-repositories";
import { InsufficientStockError, recordStockOut } from "./record-stock-out";
import type { StockMovement } from "@/domain/stock-movement/stock-movement-repository";

function expectMovement(actual: StockMovement, expected: { id: string; productId: string; type: StockMovement["type"]; quantity: number }) {
  expect(actual.id).toBe(expected.id);
  expect(actual.productId).toBe(expected.productId);
  expect(actual.type).toBe(expected.type);
  expect(actual.quantity).toBe(expected.quantity);
  expect(actual.createdAt).toBeInstanceOf(Date);
}

describe("recordStockOut", () => {
  it("appends a Gerakan Stok KELUAR and returns the updated Stok when units are available", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 7 });

    await expect(recordStockOut({ productId: "gula", quantity: 5 }, { products, movements })).resolves.toEqual({
      movement: { id: "2", createdAt: expect.any(Date), productId: "gula", type: "KELUAR", quantity: 5 },
      stock: 2,
    });
    expect(movements.movements).toHaveLength(2);
    expectMovement(movements.movements[0], { id: "1", productId: "gula", type: "MASUK", quantity: 7 });
    expectMovement(movements.movements[1], { id: "2", productId: "gula", type: "KELUAR", quantity: 5 });
  });

  it("rejects a Stok Keluar that would make the Stok negative without appending a movement", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 2 });

    await expect(recordStockOut({ productId: "gula", quantity: 3 }, { products, movements })).rejects.toBeInstanceOf(InsufficientStockError);
    expect(movements.movements).toHaveLength(1);
    expectMovement(movements.movements[0], { id: "1", productId: "gula", type: "MASUK", quantity: 2 });
  });
});
