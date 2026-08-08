import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import {
  InactiveProductError,
  InvalidStockOutQuantityError,
  InsufficientStockError,
} from "./stock-movement-errors";

export {
  InactiveProductError,
  InvalidStockOutQuantityError,
  InsufficientStockError,
} from "./stock-movement-errors";

type Dependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

type RecordStockOutResult = {
  movement: StockMovement;
  stock: number;
};

export async function recordStockOut(
  input: { productId: string; quantity: number },
  { products, movements }: Dependencies,
): Promise<RecordStockOutResult> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new InvalidStockOutQuantityError();
  }

  if (!(await products.findActiveById(input.productId))) {
    throw new InactiveProductError();
  }

  const currentStock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;

  if (input.quantity > currentStock) {
    throw new InsufficientStockError();
  }

  const movement = await movements.create({
    productId: input.productId,
    type: "KELUAR",
    quantity: input.quantity,
  });

  return { movement, stock: currentStock - input.quantity };
}
