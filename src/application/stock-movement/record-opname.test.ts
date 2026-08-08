import { describe, expect, it } from "vitest";

import { InMemoryProductRepository, InMemoryStockMovementRepository } from "@/application/__tests__/in-memory-repositories";
import { EmptyReasonError, InactiveProductError, InvalidOpnameQuantityError, recordOpname } from "./record-opname";

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
  });

  it("rejects an Opname with a negative quantity", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "gula", quantityAfter: -1, reason: "tes" }, { products, movements }),
    ).rejects.toBeInstanceOf(InvalidOpnameQuantityError);
  });

  it("rejects an Opname with an empty or whitespace-only reason", async () => {
    const products = new InMemoryProductRepository([
      { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 0, reason: "" }, { products, movements }),
    ).rejects.toBeInstanceOf(EmptyReasonError);

    await expect(
      recordOpname({ productId: "gula", quantityAfter: 0, reason: "   " }, { products, movements }),
    ).rejects.toBeInstanceOf(EmptyReasonError);
  });

  it("rejects Opname against an inactive Produk", async () => {
    const products = new InMemoryProductRepository([
      { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
    ]);
    const movements = new InMemoryStockMovementRepository();

    await expect(
      recordOpname({ productId: "lama", quantityAfter: 5, reason: "tes" }, { products, movements }),
    ).rejects.toBeInstanceOf(InactiveProductError);
  });
});
