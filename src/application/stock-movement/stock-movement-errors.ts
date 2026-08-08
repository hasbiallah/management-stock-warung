export class InactiveProductError extends Error {
  constructor() {
    super("Produk aktif tidak ditemukan.");
  }
}
