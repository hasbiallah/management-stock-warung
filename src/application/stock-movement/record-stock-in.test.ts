import { describe, expect, it } from "vitest";

import {
  InactiveProductError,
  recordStockIn,
} from "./record-stock-in";
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
    return this.products.find((product) => product.id === id && product.active) ?? null;
  }
}

class InMemoryStockMovementRepository implements StockMovementRepository {
  movements: StockMovement[] = [];

  async create(input: CreateStockMovement): Promise<StockMovement> {
    const movement: StockMovement = { id: String(this.movements.length + 1), createdAt: new Date(), ...input };
    this.movements.push(movement);
    return movement;
  }

  async findByProductId(): Promise<StockMovementWithStockAfter[]> { throw new Error("not used"); }

  async findCurrentStocks(productIds: string[]): Promise<Record<string, number>> {
    return Object.fromEntries(productIds.map((productId) => [
      productId,
      this.movements
        .filter((movement) => movement.productId === productId)
        .reduce((stock, movement) => stock + movement.quantity, 0),
    ]));
  }
}

function expectMovement(actual: StockMovement, expected: { id: string; productId: string; type: StockMovement["type"]; quantity: number; quantityAfter?: number | null; reason?: string | null }) {
  expect(actual.id).toBe(expected.id);
  expect(actual.productId).toBe(expected.productId);
  expect(actual.type).toBe(expected.type);
  expect(actual.quantity).toBe(expected.quantity);
  expect(actual.quantityAfter ?? null).toBe(expected.quantityAfter ?? null);
  expect(actual.reason ?? null).toBe(expected.reason ?? null);
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
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(recordStockIn({ productId: "lama", quantity: 5 }, { products, movements })).rejects.toBeInstanceOf(InactiveProductError);
    expect(movements.movements).toEqual([]);
  });
});
