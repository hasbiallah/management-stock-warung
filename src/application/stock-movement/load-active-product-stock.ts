import type { ProductRepository } from "@/domain/product/product-repository";
import type { StockMovementRepository } from "@/domain/stock-movement/stock-movement-repository";
import { InactiveProductError } from "./stock-movement-errors";

export type ActiveProductStock = {
  currentStock: number;
};

export async function loadActiveProductStock(
  productId: string,
  { products, movements }: { products: ProductRepository; movements: StockMovementRepository },
): Promise<ActiveProductStock> {
  if (!(await products.findActiveById(productId))) {
    throw new InactiveProductError();
  }
  const currentStock = (await movements.computeStocks([productId]))[productId] ?? 0;
  return { currentStock };
}
