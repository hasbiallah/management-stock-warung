import { describe, it, expect } from "vitest";
import { computeCurrentStock, computeStockHistory } from "./stock-calculator";
import type { MovementInput } from "./stock-ledger";

describe("computeCurrentStock", () => {
  it("returns 0 for empty movements", () => {
    expect(computeCurrentStock([])).toBe(0);
  });

  it("accumulates MASUK movements", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 10, quantityAfter: null },
      { type: "MASUK", quantity: 5, quantityAfter: null },
    ];
    expect(computeCurrentStock(movements)).toBe(15);
  });

  it("subtracts KELUAR movements", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 20, quantityAfter: null },
      { type: "KELUAR", quantity: 7, quantityAfter: null },
    ];
    expect(computeCurrentStock(movements)).toBe(13);
  });

  it("sets stock to absolute value for OPNAME", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 20, quantityAfter: null },
      { type: "KELUAR", quantity: 5, quantityAfter: null },
      { type: "OPNAME", quantity: 0, quantityAfter: 12 },
    ];
    expect(computeCurrentStock(movements)).toBe(12);
  });

  it("continues accumulation after OPNAME", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 10, quantityAfter: null },
      { type: "OPNAME", quantity: 0, quantityAfter: 50 },
      { type: "KELUAR", quantity: 3, quantityAfter: null },
      { type: "MASUK", quantity: 5, quantityAfter: null },
    ];
    expect(computeCurrentStock(movements)).toBe(52);
  });
});

describe("computeStockHistory", () => {
  it("returns empty array for empty movements", () => {
    expect(computeStockHistory([])).toEqual([]);
  });

  it("tracks cumulative stock after each movement", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 10, quantityAfter: null },
      { type: "KELUAR", quantity: 3, quantityAfter: null },
      { type: "MASUK", quantity: 5, quantityAfter: null },
    ];

    const history = computeStockHistory(movements);

    expect(history).toEqual([
      { type: "MASUK", quantity: 10, quantityAfter: null, stockAfter: 10 },
      { type: "KELUAR", quantity: 3, quantityAfter: null, stockAfter: 7 },
      { type: "MASUK", quantity: 5, quantityAfter: null, stockAfter: 12 },
    ]);
  });

  it("handles OPNAME setting absolute stock", () => {
    const movements: MovementInput[] = [
      { type: "MASUK", quantity: 20, quantityAfter: null },
      { type: "OPNAME", quantity: 0, quantityAfter: 15 },
      { type: "KELUAR", quantity: 2, quantityAfter: null },
    ];

    const history = computeStockHistory(movements);

    expect(history).toEqual([
      { type: "MASUK", quantity: 20, quantityAfter: null, stockAfter: 20 },
      { type: "OPNAME", quantity: 0, quantityAfter: 15, stockAfter: 15 },
      { type: "KELUAR", quantity: 2, quantityAfter: null, stockAfter: 13 },
    ]);
  });
});
