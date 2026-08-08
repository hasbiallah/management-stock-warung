import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";

export class InactiveProductError extends Error {
  constructor() {
    super("Produk aktif tidak ditemukan.");
  }
}

export class InvalidStockQuantityError extends Error {
  constructor() {
    super("Jumlah Stok Masuk harus berupa bilangan bulat lebih dari nol.");
  }
}

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
    throw new InvalidStockQuantityError();
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
