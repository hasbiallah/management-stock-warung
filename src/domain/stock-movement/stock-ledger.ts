import type { StockMovement } from "./stock-movement-repository";

export type LedgerEntry = Pick<StockMovement, "type" | "quantity" | "quantityAfter">;

export function applyMovement(stock: number, entry: LedgerEntry): number {
  if (entry.type === "OPNAME") {
    return entry.quantityAfter ?? 0;
  }
  if (entry.type === "MASUK") {
    return stock + entry.quantity;
  }
  return stock - entry.quantity;
}

export function replayLedger(entries: readonly LedgerEntry[]): number {
  let stock = 0;
  for (const entry of entries) {
    stock = applyMovement(stock, entry);
  }
  return stock;
}
