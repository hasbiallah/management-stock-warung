import { describe, expect, it } from "vitest";
import { InMemoryProductRepository, InMemoryStockMovementRepository } from "@/application/__tests__/in-memory-repositories";
import { recordStockMovement } from "./record-stock-movement";
import type { Product } from "@/domain/product/product-repository";

describe("recordStockMovement", () => {
  describe("MASUK command", () => {
    it("appends a Gerakan Stok MASUK and returns the updated Stok for an active Produk", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();
      await movements.create({ productId: "gula", type: "MASUK", quantity: 7 });

      const result = await recordStockMovement(
        { type: "MASUK", productId: "gula", quantity: 5 },
        { products, movements }
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.movement).toMatchObject({
        id: "2",
        productId: "gula",
        type: "MASUK",
        quantity: 5,
      });
      expect(result.movement.createdAt).toBeInstanceOf(Date);
      expect(result.stock).toBe(12);
      expect(movements.movements).toHaveLength(2);
    });

    it("returns error for inactive Produk", async () => {
      const products = new InMemoryProductRepository([
        { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
      ] satisfies Product[]);
      const movements = new InMemoryStockMovementRepository();

      const result = await recordStockMovement(
        { type: "MASUK", productId: "lama", quantity: 5 },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INACTIVE_PRODUCT" } });
      expect(movements.movements).toEqual([]);
    });

    it("returns error for non-positive quantity", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();

      const result1 = await recordStockMovement(
        { type: "MASUK", productId: "gula", quantity: 0 },
        { products, movements }
      );
      expect(result1).toEqual({ success: false, error: { code: "INVALID_QUANTITY" } });

      const result2 = await recordStockMovement(
        { type: "MASUK", productId: "gula", quantity: -5 },
        { products, movements }
      );
      expect(result2).toEqual({ success: false, error: { code: "INVALID_QUANTITY" } });

      const result3 = await recordStockMovement(
        { type: "MASUK", productId: "gula", quantity: 3.5 },
        { products, movements }
      );
      expect(result3).toEqual({ success: false, error: { code: "INVALID_QUANTITY" } });
    });
  });

  describe("KELUAR command", () => {
    it("appends a Gerakan Stok KELUAR and returns the updated Stok when units are available", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();
      await movements.create({ productId: "gula", type: "MASUK", quantity: 7 });

      const result = await recordStockMovement(
        { type: "KELUAR", productId: "gula", quantity: 5 },
        { products, movements }
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.movement).toMatchObject({
        id: "2",
        productId: "gula",
        type: "KELUAR",
        quantity: 5,
      });
      expect(result.stock).toBe(2);
      expect(movements.movements).toHaveLength(2);
    });

    it("returns error when Stok would become negative", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();
      await movements.create({ productId: "gula", type: "MASUK", quantity: 2 });

      const result = await recordStockMovement(
        { type: "KELUAR", productId: "gula", quantity: 3 },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INSUFFICIENT_STOCK" } });
      expect(movements.movements).toHaveLength(1);
    });

    it("returns error for inactive Produk", async () => {
      const products = new InMemoryProductRepository([
        { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
      ] satisfies Product[]);
      const movements = new InMemoryStockMovementRepository();

      const result = await recordStockMovement(
        { type: "KELUAR", productId: "lama", quantity: 5 },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INACTIVE_PRODUCT" } });
    });

    it("returns error for non-positive quantity", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();

      const result = await recordStockMovement(
        { type: "KELUAR", productId: "gula", quantity: 0 },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INVALID_QUANTITY" } });
    });
  });

  describe("OPNAME command", () => {
    it("appends a Gerakan Stok OPNAME with absolute quantity and reason", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();
      await movements.create({ productId: "gula", type: "MASUK", quantity: 10 });
      await movements.create({ productId: "gula", type: "KELUAR", quantity: 3 });

      const result = await recordStockMovement(
        { type: "OPNAME", productId: "gula", quantityAfter: 5, reason: "Hitung fisik bulanan" },
        { products, movements }
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.movement).toMatchObject({
        id: "3",
        productId: "gula",
        type: "OPNAME",
        quantity: 0,
        quantityAfter: 5,
        reason: "Hitung fisik bulanan",
      });
      expect(result.stock).toBe(5);
      expect(result.previousStock).toBe(7);
      expect(movements.movements).toHaveLength(3);
    });

    it("returns error for negative quantity", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();

      const result = await recordStockMovement(
        { type: "OPNAME", productId: "gula", quantityAfter: -1, reason: "tes" },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INVALID_QUANTITY" } });
    });

    it("returns error for empty or whitespace-only reason", async () => {
      const products = new InMemoryProductRepository([
        { id: "gula", name: "Gula Pasir", unit: "kg", sellingPrice: 18_000, minimumStock: 3, active: true },
      ]);
      const movements = new InMemoryStockMovementRepository();

      const result1 = await recordStockMovement(
        { type: "OPNAME", productId: "gula", quantityAfter: 0, reason: "" },
        { products, movements }
      );
      expect(result1).toEqual({ success: false, error: { code: "EMPTY_REASON" } });

      const result2 = await recordStockMovement(
        { type: "OPNAME", productId: "gula", quantityAfter: 0, reason: "   " },
        { products, movements }
      );
      expect(result2).toEqual({ success: false, error: { code: "EMPTY_REASON" } });
    });

    it("returns error for inactive Produk", async () => {
      const products = new InMemoryProductRepository([
        { id: "lama", name: "Produk Lama", unit: "pcs", sellingPrice: 1_000, minimumStock: 1, active: false },
      ]);
      const movements = new InMemoryStockMovementRepository();

      const result = await recordStockMovement(
        { type: "OPNAME", productId: "lama", quantityAfter: 5, reason: "tes" },
        { products, movements }
      );

      expect(result).toEqual({ success: false, error: { code: "INACTIVE_PRODUCT" } });
    });
  });
});
