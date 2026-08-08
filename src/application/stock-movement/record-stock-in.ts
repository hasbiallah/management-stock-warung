import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import { InvalidStockInQuantityError } from "./stock-movement-errors";
import { loadActiveProductStock } from "./load-active-product-stock";

export { InactiveProductError, InvalidStockInQuantityError } from "./stock-movement-errors";

export type RecordStockMovementDependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

export type RecordStockMovementResult = {
  movement: StockMovement;
  stock: number;
};

export async function recordStockIn(
  input: { productId: string; quantity: number },
  deps: RecordStockMovementDependencies,
): Promise<RecordStockMovementResult> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new InvalidStockInQuantityError();
  }
  const { currentStock } = await loadActiveProductStock(input.productId, deps);
  const movement = await deps.movements.create({
    productId: input.productId,
    type: "MASUK",
    quantity: input.quantity,
  });
  return { movement, stock: currentStock + input.quantity };
}
