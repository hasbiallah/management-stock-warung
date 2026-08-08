import { computeCurrentStock, computeStockHistory } from "@/domain/stock-movement/stock-calculator";
import type {
  CreateProduct,
  Product,
  ProductRepository,
  UpdateProduct,
} from "@/domain/product/product-repository";
import type {
  CreateStockMovement,
  StockMovement,
  StockMovementRepository,
  StockMovementWithStockAfter,
} from "@/domain/stock-movement/stock-movement-repository";

export class InMemoryProductRepository implements ProductRepository {
  products: Product[];

  constructor(products: Product[] = []) {
    this.products = products;
  }

  async create(input: CreateProduct): Promise<Product> {
    const product = { id: String(this.products.length + 1), active: true, ...input };
    this.products.push(product);
    return product;
  }

  async update(id: string, input: UpdateProduct): Promise<Product | null> {
    const product = this.products.find((candidate) => candidate.id === id);

    if (!product) {
      return null;
    }

    Object.assign(product, input);
    return product;
  }

  async deactivate(id: string): Promise<boolean> {
    const product = this.products.find((candidate) => candidate.id === id);

    if (!product) {
      return false;
    }

    product.active = false;
    return true;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }

  async findActiveById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id && product.active) ?? null;
  }

  async findActiveByName(query: string): Promise<Product[]> {
    return this.products.filter(
      (product) => product.active && product.name.toLowerCase().includes(query.toLowerCase()),
    );
  }
}

export class InMemoryStockMovementRepository implements StockMovementRepository {
  movements: StockMovement[];

  constructor(movements: StockMovement[] = []) {
    this.movements = movements;
  }

  async create(input: CreateStockMovement): Promise<StockMovement> {
    const movement: StockMovement = { id: String(this.movements.length + 1), createdAt: new Date(), ...input };
    this.movements.push(movement);
    return movement;
  }

  async findByProductId(productId: string): Promise<StockMovementWithStockAfter[]> {
    const rows = this.movements
      .filter((movement) => movement.productId === productId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return computeStockHistory(rows);
  }

  async computeStocks(productIds: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const productId of productIds) {
      const movements = this.movements.filter((movement) => movement.productId === productId);
      result[productId] = computeCurrentStock(movements);
    }
    return result;
  }
}
