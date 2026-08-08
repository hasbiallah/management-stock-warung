export class InactiveProductError extends Error {
  constructor() {
    super("Produk aktif tidak ditemukan.");
  }
}

export class InvalidOpnameQuantityError extends Error {
  constructor() {
    super("Jumlah stok hasil hitung fisik harus berupa bilangan bulat tidak negatif.");
  }
}

export class EmptyReasonError extends Error {
  constructor() {
    super("Alasan Opname wajib diisi.");
  }
}
