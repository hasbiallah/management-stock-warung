import type { StockMovement } from "./stock-movement-repository";

export type MovementInput = Pick<StockMovement, "type" | "quantity" | "quantityAfter">;

export function applyMovement(stock: number, entry: MovementInput): number {
  if (entry.type === "OPNAME") {
    return entry.quantityAfter ?? 0;
  }
  if (entry.type === "MASUK") {
    return stock + entry.quantity;
  }
  return stock - entry.quantity;
}
