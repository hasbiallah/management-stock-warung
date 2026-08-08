import { describe, expect, it } from "vitest";

import {
  createProduct,
  deactivateProduct,
  listActiveProducts,
  updateProduct,
} from "./manage-product-catalogue";
import type {
  CreateProduct,
  Product,
  ProductRepository,
  UpdateProduct,
} from "@/domain/product/product-repository";
import type {
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";

class InMemoryProductRepository implements ProductRepository {
  products: Product[] = [];

  async create(input: CreateProduct): Promise<Product> {
    const product = { id: String(this.products.length + 1), active: true, ...input };
    this.products.push(product);
    return product;
  }

  async update(id: string, input: UpdateProduct): Promise<Product | null> {
    const product = this.products.find((candidate) => candidate.id === id);

    if (!product) {
      return null;
    }

    Object.assign(product, input);
    return product;
  }

  async deactivate(id: string): Promise<boolean> {
    const product = this.products.find((candidate) => candidate.id === id);

    if (!product) {
      return false;
    }

    product.active = false;
    return true;
  }

  async findActiveByName(query: string): Promise<Product[]> {
    return this.products.filter(
      (product) => product.active && product.name.toLowerCase().includes(query.toLowerCase()),
    );
  }
}

class InMemoryStockMovementRepository implements StockMovementRepository {
  stocks: Record<string, number> = {};

  async findCurrentStocks(productIds: string[]): Promise<Record<string, number>> {
    return Object.fromEntries(productIds.map((productId) => [productId, this.stocks[productId] ?? 0]));
  }
}

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
    movements.stocks[gula.id] = 2;

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
