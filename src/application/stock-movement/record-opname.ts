import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import {
  EmptyReasonError,
  InactiveProductError,
  InvalidOpnameQuantityError,
} from "./stock-movement-errors";

export { InactiveProductError, EmptyReasonError, InvalidOpnameQuantityError } from "./stock-movement-errors";

type Dependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

type RecordOpnameResult = {
  movement: StockMovement;
  stock: number;
  previousStock: number;
};

export async function recordOpname(
  input: { productId: string; quantityAfter: number; reason: string },
  { products, movements }: Dependencies,
): Promise<RecordOpnameResult> {
  if (!Number.isInteger(input.quantityAfter) || input.quantityAfter < 0) {
    throw new InvalidOpnameQuantityError();
  }

  if (!input.reason || input.reason.trim().length === 0) {
    throw new EmptyReasonError();
  }

  if (!(await products.findActiveById(input.productId))) {
    throw new InactiveProductError();
  }

  const previousStock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;
  const movement = await movements.create({
    productId: input.productId,
    type: "OPNAME",
    quantity: 0,
    quantityAfter: input.quantityAfter,
    reason: input.reason.trim(),
  });

  return { movement, stock: input.quantityAfter, previousStock };
}
