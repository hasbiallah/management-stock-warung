export type Product = {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  minimumStock: number;
  active: boolean;
};

export type CreateProduct = Omit<Product, "id" | "active">;
export type UpdateProduct = CreateProduct;

export interface ProductRepository {
  create(input: CreateProduct): Promise<Product>;
  update(id: string, input: UpdateProduct): Promise<Product | null>;
  deactivate(id: string): Promise<boolean>;
  findById(id: string): Promise<Product | null>;
  findActiveById(id: string): Promise<Product | null>;
  findActiveByName(query: string): Promise<Product[]>;
}
