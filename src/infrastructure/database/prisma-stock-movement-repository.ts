import { Prisma } from "@prisma/client";

import { applyMovement } from "@/domain/stock-movement/stock-ledger";
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

  async findCurrentStocks(productIds: string[]): Promise<Record<string, number>> {
    if (productIds.length === 0) {
      return {};
    }

    const rows = await prisma.$queryRaw<Array<{ productId: string; stock: bigint }>>(Prisma.sql`
      SELECT
        \`productId\` AS productId,
        CAST(
          COALESCE((
            SELECT \`quantityAfter\`
            FROM \`StockMovement\` AS latest_opname
            WHERE latest_opname.\`productId\` = m.\`productId\`
              AND latest_opname.\`type\` = 'OPNAME'
            ORDER BY latest_opname.\`createdAt\` DESC, latest_opname.\`id\` DESC
            LIMIT 1
          ), 0)
          + COALESCE(SUM(CASE
            WHEN m.\`type\` = 'MASUK' THEN m.\`quantity\`
            WHEN m.\`type\` = 'KELUAR' THEN -m.\`quantity\`
            ELSE 0
          END), 0)
          AS SIGNED
        ) AS stock
      FROM \`StockMovement\` AS m
      WHERE m.\`productId\` IN (${Prisma.join(productIds)})
        AND (m.\`createdAt\`, m.\`id\`) > (
          SELECT COALESCE(MAX((opname.\`createdAt\`, opname.\`id\`)), (TIMESTAMP '1970-01-01', ''))
          FROM \`StockMovement\` AS opname
          WHERE opname.\`productId\` = m.\`productId\`
            AND opname.\`type\` = 'OPNAME'
        )
      GROUP BY m.\`productId\`
    `);

    return Object.fromEntries(rows.map((row) => [row.productId, Number(row.stock)]));
  }

  async findByProductId(productId: string): Promise<StockMovementWithStockAfter[]> {
    const rows = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    let stock = 0;
    const withStockAfter: StockMovementWithStockAfter[] = [];

    for (const row of rows) {
      stock = applyMovement(stock, row);
      withStockAfter.push({ ...row, stockAfter: stock });
    }

    return withStockAfter;
  }
}
