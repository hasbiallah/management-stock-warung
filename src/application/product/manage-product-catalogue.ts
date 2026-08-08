import type {
  CreateProduct,
  Product,
  ProductRepository,
  UpdateProduct,
} from "@/domain/product/product-repository";
import type {
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";

type ProductDependencies = {
  products: ProductRepository;
};

type CatalogueDependencies = ProductDependencies & {
  movements: StockMovementRepository;
};

export type CatalogueProduct = Product & {
  stock: number;
  isLowStock: boolean;
};

function normaliseProduct(input: CreateProduct | UpdateProduct): CreateProduct {
  return {
    ...input,
    name: input.name.trim(),
    unit: input.unit.trim(),
  };
}

export function createProduct(input: CreateProduct, { products }: ProductDependencies): Promise<Product> {
  return products.create(normaliseProduct(input));
}

export function updateProduct(
  id: string,
  input: UpdateProduct,
  { products }: ProductDependencies,
): Promise<Product | null> {
  return products.update(id, normaliseProduct(input));
}

export function deactivateProduct(id: string, { products }: ProductDependencies): Promise<boolean> {
  return products.deactivate(id);
}

export async function listActiveProducts(
  { query = "", includeStock = true }: { query?: string; includeStock?: boolean },
  { products, movements }: CatalogueDependencies,
): Promise<CatalogueProduct[]> {
  const activeProducts = await products.findActiveByName(query.trim());

  if (!includeStock) {
    return activeProducts.map((product) => ({
      ...product,
      stock: 0,
      isLowStock: false,
    }));
  }

  const productIds = activeProducts.map((product) => product.id);
  const currentStocks = await movements.computeStocks(productIds);

  return activeProducts.map((product) => {
    const stock = currentStocks[product.id] ?? 0;

    return { ...product, stock, isLowStock: stock < product.minimumStock };
  });
}
