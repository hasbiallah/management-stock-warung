import { Prisma } from "@prisma/client";

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
      WITH sequenced_movements AS (
        SELECT
          \`productId\`, \`type\`, \`quantity\`, \`quantityAfter\`,
          ROW_NUMBER() OVER (PARTITION BY \`productId\` ORDER BY \`createdAt\`, \`id\`) AS sequence_number
        FROM \`StockMovement\`
        WHERE \`productId\` IN (${Prisma.join(productIds)})
      ), movement_bases AS (
        SELECT \`productId\`, MAX(CASE WHEN \`type\` = 'OPNAME' THEN sequence_number ELSE 0 END) AS opname_sequence
        FROM sequenced_movements
        GROUP BY \`productId\`
      )
      SELECT
        movement.\`productId\` AS productId,
        CAST(
          COALESCE(MAX(CASE WHEN movement.\`type\` = 'OPNAME' AND movement.sequence_number = base.opname_sequence THEN movement.\`quantityAfter\` END), 0)
          + COALESCE(SUM(CASE
            WHEN movement.sequence_number > base.opname_sequence AND movement.\`type\` = 'MASUK' THEN movement.\`quantity\`
            WHEN movement.sequence_number > base.opname_sequence AND movement.\`type\` = 'KELUAR' THEN -movement.\`quantity\`
            ELSE 0
          END), 0) AS SIGNED
        ) AS stock
      FROM sequenced_movements AS movement
      INNER JOIN movement_bases AS base ON base.\`productId\` = movement.\`productId\`
      GROUP BY movement.\`productId\`
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
      if (row.type === "OPNAME") {
        stock = row.quantityAfter ?? 0;
      } else if (row.type === "MASUK") {
        stock += row.quantity;
      } else {
        stock -= row.quantity;
      }
      withStockAfter.push({ ...row, stockAfter: stock });
    }

    return withStockAfter;
  }
}
