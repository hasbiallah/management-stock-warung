import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import { InactiveProductError } from "./stock-movement-errors";

export { InactiveProductError } from "./stock-movement-errors";

export class InvalidStockQuantityError extends Error {
  constructor() {
    super("Jumlah Stok Keluar harus berupa bilangan bulat lebih dari nol.");
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super("Stok tersedia tidak mencukupi.");
  }
}

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
    throw new InvalidStockQuantityError();
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
  const stock = (await movements.findCurrentStocks([input.productId]))[input.productId] ?? 0;

  return { movement, stock };
}
