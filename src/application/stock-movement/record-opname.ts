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
  // Validate quantity - must be non-negative integer
  if (!Number.isInteger(input.quantityAfter) || input.quantityAfter < 0) {
    throw new InvalidOpnameQuantityError();
  }

  // Validate reason - must not be empty or whitespace only
  if (!input.reason || input.reason.trim().length === 0) {
    throw new EmptyReasonError();
  }

  // Validate product - must be active
  if (!(await products.findActiveById(input.productId))) {
    throw new InactiveProductError();
  }

  // Get previous stock before recording opname
  const previousStock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;

  // Record the Opname movement with absolute quantity
  const movement = await movements.create({
    productId: input.productId,
    type: "OPNAME",
    quantity: 0, // Opname doesn't use delta quantity
    quantityAfter: input.quantityAfter,
    reason: input.reason.trim(),
  });

  // Get new stock after opname (should equal quantityAfter)
  const stock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;

  return { movement, stock, previousStock };
}
