import type {
  CreateProduct,
  Product,
  ProductRepository,
  UpdateProduct,
} from "@/domain/product/product-repository";

import { prisma } from "./prisma-client";

function toProduct(product: {
  id: string;
  name: string;
  unit: string;
  sellingPrice: { toNumber(): number };
  minimumStock: number;
  active: boolean;
}): Product {
  return {
    ...product,
    sellingPrice: product.sellingPrice.toNumber(),
  };
}

export class PrismaProductRepository implements ProductRepository {
  async create(input: CreateProduct): Promise<Product> {
    return toProduct(await prisma.product.create({ data: input }));
  }

  async update(id: string, input: UpdateProduct): Promise<Product | null> {
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return null;
    }

    return toProduct(await prisma.product.update({ where: { id }, data: input }));
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await prisma.product.updateMany({ where: { id, active: true }, data: { active: false } });
    return result.count === 1;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    return product ? toProduct(product) : null;
  }

  async findActiveById(id: string): Promise<Product | null> {
    const product = await prisma.product.findFirst({ where: { id, active: true } });
    return product ? toProduct(product) : null;
  }

  async findActiveByName(query: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { active: true, name: { contains: query } },
      orderBy: { name: "asc" },
    });

    return products.map(toProduct);
  }
}
