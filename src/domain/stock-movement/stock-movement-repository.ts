export type StockMovementType = "MASUK" | "KELUAR" | "OPNAME";

export interface StockMovementRepository {
  findCurrentStocks(productIds: string[]): Promise<Record<string, number>>;
}
