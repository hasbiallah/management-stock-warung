import { describe, expect, it } from "vitest";

import {
  EmptyReasonError,
  InactiveProductError,
  InvalidOpnameQuantityError,
  recordOpname,
} from "./record-opname";
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
  async findById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

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
    return Object.fromEntries(
      productIds.map((productId) => {
        let stock = 0;
        const productMovements = this.movements.filter((m) => m.productId === productId);
        for (const movement of productMovements) {
          if (movement.type === "OPNAME") {
            stock = movement.quantityAfter ?? 0;
          } else if (movement.type === "MASUK") {
            stock += movement.quantity;
          } else if (movement.type === "KELUAR") {
            stock -= movement.quantity;
          }
        }
        return [productId, stock];
      }),
    );
  }
}

describe("recordOpname", () => {
  it("appends a Gerakan Stok OPNAME with absolute quantity and reason, then returns the new stock", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 10 });
    await movements.create({ productId: "gula", type: "KELUAR", quantity: 3 });

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 5, reason: "Hitung fisik bulanan" }, { products, movements }),
    ).resolves.toEqual({
      movement: { id: "3", createdAt: expect.any(Date), productId: "gula", type: "OPNAME", quantity: 0, quantityAfter: 5, reason: "Hitung fisik bulanan" },
      stock: 5,
      previousStock: 7,
    });
    expect(movements.movements).toHaveLength(3);
    expect(movements.movements[2].quantityAfter).toBe(5);
    expect(movements.movements[2].reason).toBe("Hitung fisik bulanan");
  });

  it("sets Stok to the absolute quantityAfter value, not a delta", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();
    await movements.create({ productId: "gula", type: "MASUK", quantity: 10 });

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 8, reason: "Koreksi stok" }, { products, movements }),
    ).resolves.toEqual({
      movement: { id: "2", createdAt: expect.any(Date), productId: "gula", type: "OPNAME", quantity: 0, quantityAfter: 8, reason: "Koreksi stok" },
      stock: 8,
      previousStock: 10,
    });
  });

  it("rejects Opname with empty or whitespace-only reason", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 5, reason: "" }, { products, movements }),
    ).rejects.toBeInstanceOf(EmptyReasonError);
    await expect(
      recordOpname({ productId: "gula", quantityAfter: 5, reason: "   " }, { products, movements }),
    ).rejects.toBeInstanceOf(EmptyReasonError);
    expect(movements.movements).toEqual([]);
  });

  it("rejects Opname with negative quantityAfter", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "gula", quantityAfter: -1, reason: "Invalid" }, { products, movements }),
    ).rejects.toBeInstanceOf(InvalidOpnameQuantityError);
    expect(movements.movements).toEqual([]);
  });

  it("does not record Opname for an inactive Produk", async () => {
    const products = new InMemoryProductRepository([
      { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "lama", quantityAfter: 5, reason: "Hitung fisik" }, { products, movements }),
    ).rejects.toBeInstanceOf(InactiveProductError);
    expect(movements.movements).toEqual([]);
  });

  it("allows quantityAfter of zero for products that are out of stock", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 0, reason: "Stok habis setelah hitung" }, { products, movements }),
    ).resolves.toEqual({
      movement: { id: "1", createdAt: expect.any(Date), productId: "gula", type: "OPNAME", quantity: 0, quantityAfter: 0, reason: "Stok habis setelah hitung" },
      stock: 0,
      previousStock: 0,
    });
  });
});
