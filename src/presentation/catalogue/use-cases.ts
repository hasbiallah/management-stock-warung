import { PrismaProductRepository } from "@/infrastructure/database/prisma-product-repository";
import { PrismaStockMovementRepository } from "@/infrastructure/database/prisma-stock-movement-repository";
import {
  createProduct,
  deactivateProduct,
  listActiveProducts,
  updateProduct,
} from "@/application/product/manage-product-catalogue";
import { listRiwayatStok, serialiseRiwayatStokToCsv } from "@/application/stock-movement/list-riwayat-stok";
import { recordOpname } from "@/application/stock-movement/record-opname";
import { recordStockIn } from "@/application/stock-movement/record-stock-in";
import { recordStockOut } from "@/application/stock-movement/record-stock-out";

const products = new PrismaProductRepository();
const movements = new PrismaStockMovementRepository();

const productDependencies = { products };
const catalogueDependencies = { ...productDependencies, movements };

export const catalogueUseCases = {
  createProduct: (input: Parameters<typeof createProduct>[0]) => createProduct(input, productDependencies),
  updateProduct: (id: string, input: Parameters<typeof updateProduct>[1]) => updateProduct(id, input, productDependencies),
  deactivateProduct: (id: string) => deactivateProduct(id, productDependencies),
  listActiveProducts: (input: Parameters<typeof listActiveProducts>[0] = {}) => listActiveProducts(input, catalogueDependencies),
  recordStockIn: (input: Parameters<typeof recordStockIn>[0]) => recordStockIn(input, catalogueDependencies),
  recordStockOut: (input: Parameters<typeof recordStockOut>[0]) => recordStockOut(input, catalogueDependencies),
  recordOpname: (input: Parameters<typeof recordOpname>[0]) => recordOpname(input, catalogueDependencies),
  listRiwayatStok: (input: Parameters<typeof listRiwayatStok>[0]) => listRiwayatStok(input, catalogueDependencies),
  serialiseRiwayatStokToCsv,
};
