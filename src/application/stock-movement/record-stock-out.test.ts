import { describe, expect, it } from "vitest";

import { InsufficientStockError, recordStockOut } from "./record-stock-out";
import type { Product, ProductRepository } from "@/domain/product/product-repository";
import type {
  CreateStockMovement,
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";

class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[]) {}

  async create(): Promise<Product> {
    throw new Error("Not used in this test.");
  }

  async update(): Promise<Product | null> {
    throw new Error("Not used in this test.");
  }

  async deactivate(): Promise<boolean> {
    throw new Error("Not used in this test.");
  }

  async findActiveByName(): Promise<Product[]> {
    throw new Error("Not used in this test.");
  }

  async findActiveById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id && product.active) ?? null;
  }
}

class InMemoryStockMovementRepository implements StockMovementRepository {
  movements: StockMovement[] = [];

  async create(input: CreateStockMovement): Promise<StockMovement> {
    const movement = { id: String(this.movements.length + 1), ...input };
    this.movements.push(movement);
    return movement;
  }

  async findCurrentStocks(productIds: string[]): Promise<Record<string, number>> {
    return Object.fromEntries(productIds.map((productId) => [
      productId,
      this.movements
        .filter((movement) => movement.productId === productId)
        .reduce((stock, movement) => movement.type === "KELUAR" ? stock - movement.quantity : stock + movement.quantity, 0),
    ]));
  }
}

describe("recordStockOut", () => {
  it("appends a Gerakan Stok KELUAR and returns the updated Stok when units are available", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 7 });

    await expect(recordStockOut({ productId: "gula", quantity: 5 }, { products, movements })).resolves.toEqual({
      movement: { id: "2", productId: "gula", type: "KELUAR", quantity: 5 },
      stock: 2,
    });
    expect(movements.movements).toEqual([
      { id: "1", productId: "gula", type: "MASUK", quantity: 7 },
      { id: "2", productId: "gula", type: "KELUAR", quantity: 5 },
    ]);
  });

  it("rejects a Stok Keluar that would make the Stok negative without appending a movement", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 2 });

    await expect(recordStockOut({ productId: "gula", quantity: 3 }, { products, movements })).rejects.toBeInstanceOf(InsufficientStockError);
    expect(movements.movements).toEqual([
      { id: "1", productId: "gula", type: "MASUK", quantity: 2 },
    ]);
  });
});
