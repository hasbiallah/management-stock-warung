import type { MovementInput } from "./stock-ledger";
import { applyMovement } from "./stock-ledger";

export function computeCurrentStock(movements: MovementInput[]): number {
  let stock = 0;
  for (const movement of movements) {
    stock = applyMovement(stock, movement);
  }
  return stock;
}

export function computeStockHistory<T extends MovementInput>(movements: T[]): (T & { stockAfter: number })[] {
  let stock = 0;
  const history: (T & { stockAfter: number })[] = [];

  for (const movement of movements) {
    stock = applyMovement(stock, movement);
    history.push({ ...movement, stockAfter: stock });
  }

  return history;
}
