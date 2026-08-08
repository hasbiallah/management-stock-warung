import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import { InactiveProductError, InvalidStockInQuantityError } from "./stock-movement-errors";

export { InactiveProductError, InvalidStockInQuantityError } from "./stock-movement-errors";

type Dependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

type RecordStockInResult = {
  movement: StockMovement;
  stock: number;
};

export async function recordStockIn(
  input: { productId: string; quantity: number },
  { products, movements }: Dependencies,
): Promise<RecordStockInResult> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new InvalidStockInQuantityError();
  }

  if (!(await products.findActiveById(input.productId))) {
    throw new InactiveProductError();
  }

  const movement = await movements.create({
    productId: input.productId,
    type: "MASUK",
    quantity: input.quantity,
  });
  const stock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;

  return { movement, stock };
}
