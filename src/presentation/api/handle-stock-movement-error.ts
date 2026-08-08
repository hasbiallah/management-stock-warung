import { NextResponse } from "next/server";
import {
  EmptyReasonError,
  InactiveProductError,
  InsufficientStockError,
  InvalidOpnameQuantityError,
  InvalidStockInQuantityError,
  InvalidStockOutQuantityError,
  ProductNotFoundError,
} from "@/application/stock-movement";

const STOCK_MOVEMENT_ERROR_STATUS: ReadonlyArray<readonly [new (...args: never[]) => Error, number]> = [
  [InactiveProductError, 404],
  [ProductNotFoundError, 404],
  [InvalidStockInQuantityError, 400],
  [InvalidStockOutQuantityError, 400],
  [InsufficientStockError, 400],
  [InvalidOpnameQuantityError, 400],
  [EmptyReasonError, 400],
];

export function stockMovementErrorResponse(error: Error): NextResponse {
  for (const [ctor, status] of STOCK_MOVEMENT_ERROR_STATUS) {
    if (error instanceof ctor) {
      return NextResponse.json({ error: error.message }, { status });
    }
  }
  throw error;
}
