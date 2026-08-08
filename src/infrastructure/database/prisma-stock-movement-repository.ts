import { computeCurrentStock, computeStockHistory } from "@/domain/stock-movement/stock-calculator";
import type {
  CreateStockMovement,
  StockMovement,
  StockMovementRepository,
  StockMovementWithStockAfter,
} from "@/domain/stock-movement/stock-movement-repository";

import { prisma } from "./prisma-client";

export class PrismaStockMovementRepository implements StockMovementRepository {
  async create(input: CreateStockMovement): Promise<StockMovement> {
    return prisma.stockMovement.create({ data: input });
  }

  async computeStocks(productIds: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const productId of productIds) {
      result[productId] = (await this.replayForProduct(productId)).current;
    }
    return result;
  }

  async findByProductId(productId: string): Promise<StockMovementWithStockAfter[]> {
    return (await this.replayForProduct(productId)).entries;
  }

  private async replayForProduct(productId: string): Promise<{
    entries: StockMovementWithStockAfter[];
    current: number;
  }> {
    const rows = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const entries = computeStockHistory(rows);
    const current = computeCurrentStock(rows);

    return { entries, current };
  }
}
