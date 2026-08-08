export type StockMovementType = "MASUK" | "KELUAR" | "OPNAME";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  quantityAfter?: number | null;
  reason?: string | null;
};

export type CreateStockMovement = Omit<StockMovement, "id">;

export interface StockMovementRepository {
  create(input: CreateStockMovement): Promise<StockMovement>;
  findCurrentStocks(productIds: string[]): Promise<Record<string, number>>;
}
