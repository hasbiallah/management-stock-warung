import { describe, expect, it } from "vitest";

import { InMemoryProductRepository, InMemoryStockMovementRepository } from "@/application/__tests__/in-memory-repositories";
import { createProduct, deactivateProduct, listActiveProducts, updateProduct } from "./manage-product-catalogue";

describe("product catalogue", () => {
  it("creates a Produk with its catalogue details", async () => {
    const products = new InMemoryProductRepository();

    await expect(
      createProduct(
        { name: " Gula Pasir ", unit: " kg ", sellingPrice: 18_000, minimumStock: 3 },
        { products },
      ),
    ).resolves.toMatchObject({
      name: "Gula Pasir",
      unit: "kg",
      sellingPrice: 18_000,
      minimumStock: 3,
      active: true,
    });
  });

  it("updates a Produk and retains its identity", async () => {
    const products = new InMemoryProductRepository();
    const product = await products.create({
      name: "Gula Pasir",
      unit: "kg",
      sellingPrice: 18_000,
      minimumStock: 3,
    });

    await expect(
      updateProduct(product.id, { name: "Gula Putih", unit: "kg", sellingPrice: 19_000, minimumStock: 4 }, { products }),
    ).resolves.toMatchObject({ id: product.id, name: "Gula Putih", sellingPrice: 19_000 });
  });

  it("hides a deactivated Produk from the active catalogue while retaining it", async () => {
    const products = new InMemoryProductRepository();
    const product = await products.create({
      name: "Gula Pasir",
      unit: "kg",
      sellingPrice: 18_000,
      minimumStock: 3,
    });

    await deactivateProduct(product.id, { products });

    await expect(products.findActiveByName("")).resolves.toEqual([]);
    expect(products.products).toHaveLength(1);
    expect(products.products[0]).toMatchObject({ id: product.id, active: false });
  });

  it("searches active Produk and calculates Stok Rendah from Gerakan Stok", async () => {
    const products = new InMemoryProductRepository();
    const movements = new InMemoryStockMovementRepository();
    const gula = await products.create({
      name: "Gula Pasir",
      unit: "kg",
      sellingPrice: 18_000,
      minimumStock: 3,
    });
    await products.create({
      name: "Minyak Goreng",
      unit: "liter",
      sellingPrice: 20_000,
      minimumStock: 2,
    });
    await movements.create({ productId: gula.id, type: "MASUK", quantity: 2 });

    await expect(listActiveProducts({ query: "gula" }, { products, movements })).resolves.toEqual([
      expect.objectContaining({
        id: gula.id,
        name: "Gula Pasir",
        stock: 2,
        isLowStock: true,
      }),
    ]);
  });
});
