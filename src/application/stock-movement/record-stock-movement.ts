import type { ProductRepository } from "@/domain/product/product-repository";
import type {
  StockMovement,
  StockMovementRepository,
} from "@/domain/stock-movement/stock-movement-repository";
import { computeCurrentStock } from "@/domain/stock-movement/stock-calculator";

export type RecordStockMovementCommand =
  | { type: "MASUK"; productId: string; quantity: number }
  | { type: "KELUAR"; productId: string; quantity: number }
  | { type: "OPNAME"; productId: string; quantityAfter: number; reason: string };

export type RecordStockMovementSuccess = {
  success: true;
  movement: StockMovement;
  stock: number;
  previousStock?: number;
};

export type RecordStockMovementFailure = {
  success: false;
  error: StockMovementError;
};

export type StockMovementError =
  | { code: "INACTIVE_PRODUCT" }
  | { code: "INVALID_QUANTITY" }
  | { code: "INSUFFICIENT_STOCK" }
  | { code: "EMPTY_REASON" };

export type RecordStockMovementResult =
  | RecordStockMovementSuccess
  | RecordStockMovementFailure;

export type RecordStockMovementDependencies = {
  products: ProductRepository;
  movements: StockMovementRepository;
};

export async function recordStockMovement(
  command: RecordStockMovementCommand,
  deps: RecordStockMovementDependencies,
): Promise<RecordStockMovementResult> {
  // Validate product is active
  const product = await deps.products.findActiveById(command.productId);
  if (!product) {
    return { success: false, error: { code: "INACTIVE_PRODUCT" } };
  }

  // Calculate current stock
  const productMovements = await deps.movements.findByProductId(command.productId);
  const currentStock = computeCurrentStock(productMovements);

  // Handle each command type
  switch (command.type) {
    case "MASUK": {
      // Validate quantity
      if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
        return { success: false, error: { code: "INVALID_QUANTITY" } };
      }

      // Create movement
      const movement = await deps.movements.create({
        productId: command.productId,
        type: "MASUK",
        quantity: command.quantity,
      });

      return {
        success: true,
        movement,
        stock: currentStock + command.quantity,
      };
    }

    case "KELUAR": {
      // Validate quantity
      if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
        return { success: false, error: { code: "INVALID_QUANTITY" } };
      }

      // Check sufficient stock
      if (command.quantity > currentStock) {
        return { success: false, error: { code: "INSUFFICIENT_STOCK" } };
      }

      // Create movement
      const movement = await deps.movements.create({
        productId: command.productId,
        type: "KELUAR",
        quantity: command.quantity,
      });

      return {
        success: true,
        movement,
        stock: currentStock - command.quantity,
      };
    }

    case "OPNAME": {
      // Validate quantity
      if (!Number.isInteger(command.quantityAfter) || command.quantityAfter < 0) {
        return { success: false, error: { code: "INVALID_QUANTITY" } };
      }

      // Validate reason
      if (!command.reason || command.reason.trim().length === 0) {
        return { success: false, error: { code: "EMPTY_REASON" } };
      }

      // Create movement
      const movement = await deps.movements.create({
        productId: command.productId,
        type: "OPNAME",
        quantity: 0,
        quantityAfter: command.quantityAfter,
        reason: command.reason.trim(),
      });

      return {
        success: true,
        movement,
        stock: command.quantityAfter,
        previousStock: currentStock,
      };
    }
  }
}
