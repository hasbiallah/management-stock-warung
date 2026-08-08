import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";

export function productDependencies() {
  return { products: new PrismaProductRepository() };
}

export function productWithStockMovementDependencies() {
  return { ...productDependencies(), movements: new PrismaStockMovementRepository() };
}

// @deprecated Use productWithStockMovementDependencies instead
export function catalogueDependencies() {
  return productWithStockMovementDependencies();
}
