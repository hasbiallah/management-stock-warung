import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import {
  InsufficientStockError,
  InvalidStockOutQuantityError,
} from "./stock-movement-errors";
import { loadActiveProductStock } from "./load-active-product-stock";
import type { RecordStockMovementDependencies, RecordStockMovementResult } from "./record-stock-in";

export {
  InactiveProductError,
  InvalidStockOutQuantityError,
  InsufficientStockError,
} from "./stock-movement-errors";

export async function recordStockOut(
  input: { productId: string; quantity: number },
  deps: RecordStockMovementDependencies,
): Promise<RecordStockMovementResult> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new InvalidStockOutQuantityError();
  }
  const { currentStock } = await loadActiveProductStock(input.productId, deps);
  if (input.quantity > currentStock) {
    throw new InsufficientStockError();
  }
  const movement = await deps.movements.create({
    productId: input.productId,
    type: "KELUAR",
    quantity: input.quantity,
  });
  return { movement, stock: currentStock - input.quantity };
}
